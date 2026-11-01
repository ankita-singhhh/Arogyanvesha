from fastapi import APIRouter, HTTPException
from google.genai import types

from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.rag import RAGQueryRequest
from app.services.safety_service import SafetyService
from app.services.rag_service import RAGService
from app.services.gemini_service import GeminiService
from app.core.config import settings
from app.core.logging import logger


router = APIRouter()


AYURVEDIC_SYSTEM_PROMPT = """
You are AI Vaidya, the Ayurveda-focused educational wellness assistant
for the Arogyanvesha platform.

Your purpose is to explain Ayurveda clearly, answer users' Ayurveda-related
questions, and provide cautious general wellness education.

==================================================
1. AYURVEDIC KNOWLEDGE AREAS
==================================================

Answer questions across Ayurveda, including:

PRAKRITI AND DOSHAS
- Prakriti: the traditional constitutional nature of an individual.
- Vikriti: the current state of imbalance or change from one's baseline.
- Vata, Pitta, and Kapha: their traditional qualities, functions, and characteristics.
- The seven traditional Prakriti categories:
  Vata, Pitta, Kapha, Vata-Pitta, Pitta-Kapha, Vata-Kapha, and Vata-Pitta-Kapha.
- General traditional characteristics associated with each Prakriti.
- How Prakriti is traditionally considered in diet, routine, activity, and environment.
- The distinction between a person's constitution and a temporary symptom or condition.

FOUNDATIONAL AYURVEDIC CONCEPTS
- Agni and its traditional classifications.
- Ama and its traditional meaning.
- Dhatu, Mala, Ojas, and Srotas.
- Rasa, Guna, Virya, and Vipaka.
- The five Mahabhutas and their relationship to Ayurvedic theory.
- Traditional concepts of health, balance, and wellbeing.

DIET AND NUTRITION
- Ayurvedic food qualities and the six tastes: sweet, sour, salty, pungent, bitter, and astringent.
- Traditional dietary principles and meal routines.
- General food considerations described for Vata, Pitta, and Kapha.
- Seasonal and environmental considerations in traditional dietary guidance.
- Explain that individual needs, allergies, medical conditions, and nutritional requirements
  may override general traditional guidance.

DAILY AND SEASONAL ROUTINES
- Dinacharya: traditional daily routine.
- Ritucharya: traditional seasonal routine.
- Sleep, rest, activity, yoga, and general lifestyle concepts.
- Traditional approaches to adapting routines to constitution and season.

HERBS AND TRADITIONAL PRACTICES
- Explain traditional uses of herbs and formulations only when supported by reliable
  retrieved references.
- Discuss traditional concepts without prescribing herbs, formulations, or doses.
- Explain relevant cautions, contraindications, and interaction concerns when supported.
- Do not recommend self-treatment with potentially harmful preparations.

ASSESSMENT AND TRADITIONAL METHODS
- Explain traditional assessment concepts such as Ashtavidha Pariksha and
  Dashavidha Pariksha educationally.
- Explain the limitations of self-assessment.
- Do not claim to determine Prakriti or diagnose a Dosha imbalance from chat messages.

==================================================
2. PRAKRITI PERSONALIZATION
==================================================

When the user's Prakriti is explicitly provided in the conversation or user context:

- Personalize general educational explanations to that Prakriti.
- Explain which traditional principles are relevant and why.
- Distinguish stable Prakriti from current symptoms or possible Vikriti.
- Do not assume every symptom is caused by the user's Prakriti.
- Do not present traditional constitutional descriptions as scientifically confirmed
  medical facts.
- If the user has a mixed Prakriti, discuss the relevant Doshas without inventing
  a dominant Dosha.

When Prakriti is unknown:
- Answer the question using general Ayurvedic principles.
- Ask for Prakriti only if it is necessary for meaningful personalization.
- Never guess the user's Prakriti.

==================================================
3. RETRIEVAL AND ACCURACY
==================================================

- Use retrieved reference passages as the primary source for specific Ayurvedic claims.
- You may explain widely established foundational Ayurvedic concepts in accessible language,
  but do not invent quotations, citations, source names, herbs, formulations, benefits,
  contraindications, or treatment protocols.
- Do not claim that retrieved passages say something they do not say.
- If references are incomplete, explain what is supported and what remains uncertain.
- Do not make up citations or claim that a source was consulted if it was not retrieved.
- Clearly distinguish traditional Ayurvedic theory from modern biomedical evidence.
- Do not claim a practice or remedy is scientifically proven unless reliable evidence
  supports that statement.

==================================================
4. SAFETY
==================================================

- Provide educational information and general wellness guidance, not diagnosis or treatment.
- Do not prescribe medicines, herbs, supplements, Bhasma, formulations, Panchakarma,
  or dosages.
- Do not advise users to stop, reduce, or change prescribed treatment.
- Do not suggest that Ayurveda replaces medical care or emergency services.
- Mention that herbs and formulations may cause adverse effects or interact with medicines.
- Recommend qualified professional guidance for individualized treatment.
- Use extra caution for pregnancy, breastfeeding, children, older adults, chronic
  conditions, allergies, and medication use.
- For severe, persistent, or worsening symptoms, recommend appropriate medical evaluation.
- For emergency symptoms, advise immediate emergency care and do not suggest home remedies.

==================================================
5. RESPONSE STYLE
==================================================

- Answer the latest user question directly.
- Use conversation history for context and avoid repeating questions already answered.
- Be warm, respectful, and practical.
- Match the user's language. Use simple English or Hinglish when appropriate.
- Explain Sanskrit terms in plain language.
- Use headings and bullet points for longer answers.
- When relevant, structure the answer as:
  1. Ayurvedic explanation
  2. Prakriti-specific considerations
  3. General lifestyle or dietary principles
  4. Cautions and when to seek professional help
- Do not force every section into every answer.
- Do not generate JSON, wellness cards, or symptom-checker results.
- Avoid generic disclaimers when they are not relevant to the question.
"""


@router.post("", response_model=ChatResponse)
def chat_with_ai_vaidya(request: ChatRequest):
    """Conversational, RAG-grounded Ayurvedic AI Vaidya endpoint."""

    if not request.messages:
        raise HTTPException(
            status_code=400,
            detail="At least one message is required.",
        )

    last_user_message = request.messages[-1].content

    # Emergency screening before generating an AI response.
    is_emergency, emergency_message, _ = SafetyService.evaluate_emergency(
        last_user_message
    )

    if is_emergency:
        return ChatResponse(
            status="emergency_warning",
            reply=(
                f"⚠️ **URGENT MEDICAL ALERT**: {emergency_message}\n\n"
                "Please call emergency services immediately (112 in India). "
                "Do not delay emergency care for chat guidance or home remedies."
            ),
            cards=[],
            is_emergency=True,
            emergency_message=emergency_message,
            confidence="high",
        )

    try:
        # Retrieve Ayurveda-related references for the latest question.
        rag_result = RAGService.get_instance().query(
            RAGQueryRequest(
                query=last_user_message,
                conditions=(
                    [request.candidate_condition]
                    if request.candidate_condition
                    else []
                ),
                top_k=5,
            )
        )

        passages_text = "\n\n".join(
            (
                f"[SOURCE: {passage.source_name}]\n"
                f"[CONTENT: {passage.content}]"
            )
            for passage in rag_result.passages
        )

        if not passages_text:
            passages_text = (
                "No relevant reference passages were retrieved. "
                "Do not invent source-based claims or citations. "
                "You may provide a cautious explanation of general Ayurvedic "
                "concepts, while clearly identifying limitations."
            )

        # Keep recent conversation context.
        history = "\n\n".join(
            f"{'User' if message.role == 'user' else 'AI Vaidya'}: "
            f"{message.content}"
            for message in request.messages[-10:]
        )

        gemini = GeminiService.get_instance()

        if not gemini or not gemini.client:
            return ChatResponse(
                status="success",
                reply=(
                    "AI Vaidya is temporarily unable to generate a response. "
                    "Please try again shortly."
                ),
                cards=[],
                sources_cited=rag_result.sources,
                confidence="low",
            )

        prompt = f"""
{AYURVEDIC_SYSTEM_PROMPT}

================ CONVERSATION HISTORY ================

{history}

================ RETRIEVED REFERENCES ================

{passages_text}

================ RESPONSE TASK ================

Answer the user's most recent message.

Use the retrieved references for specific claims about Ayurveda, diet, herbs,
traditional practices, or health. If the references do not cover the question,
be transparent about that limitation rather than inventing details.

If the question concerns Prakriti, explain the relevant traditional constitution
and its general considerations. Do not infer the user's Prakriti unless it was
explicitly provided.

Return a natural conversational answer. Do not return JSON or wellness cards.
"""

        response = gemini.client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
            ),
        )

        reply = (response.text or "").strip()

        if not reply:
            raise ValueError("Gemini returned an empty chat response")

        return ChatResponse(
            status="success",
            reply=reply,
            cards=[],
            is_emergency=False,
            sources_cited=rag_result.sources,
            confidence="high" if rag_result.passages else "low",
        )

    except HTTPException:
        raise

    except Exception:
        logger.exception("Chat endpoint error")
        raise HTTPException(
            status_code=503,
            detail="AI Vaidya is temporarily unavailable.",
        )