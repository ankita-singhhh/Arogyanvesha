
import re
from typing import Dict, Any, List, Optional, Tuple


# --------------------------------------------------
# EMERGENCY RULES
# --------------------------------------------------

EMERGENCY_RULES = [
    {
        "category": "cardiovascular",
        "patterns": [
            r"\b(crushing chest pain|severe chest pain|chest pain radiating to (arm|jaw|back))\b",
            r"\b(heart attack|myocardial infarction|dil ka daura)\b",
            r"\b(chest pain with sweating and breathlessness)\b",
            r"\b(chhati|chhati mein|chhati me|seene|sine)\s+(?:mein|me)?\s*(?:tez|bahut|severe)\s*dard\b",
        ],
        "warning_en": (
            "Possible cardiac emergency. Call emergency medical services "
            "immediately and seek emergency medical care."
        ),
        "warning_hi": (
            "हृदय संबंधी गंभीर आपातकाल की आशंका है। "
            "तुरंत आपातकालीन चिकित्सा सहायता लें।"
        ),
    },
    {
        "category": "respiratory",
        "patterns": [
            r"\b(cannot breathe|can't breathe|unable to breathe)\b",
            r"\b(severe breathlessness|gasping for air|stopped breathing)\b",
            r"\b(blue lips|bluish skin|cyanosis)\b",
            r"\b(saans nahi aa rahi|dum ghut raha hai)\b",
        ],
        "warning_en": (
            "Severe breathing difficulty detected. "
            "Call emergency medical services immediately."
        ),
        "warning_hi": (
            "सांस लेने में गंभीर कठिनाई है। "
            "तुरंत आपातकालीन चिकित्सा सहायता लें।"
        ),
    },
    {
        "category": "neurological",
        "patterns": [
            r"\b(face drooping|facial droop|slurred speech)\b",
            r"\b(sudden weakness on one side|one sided paralysis)\b",
            r"\b(sudden loss of vision|sudden loss of speech)\b",
            r"\b(unconscious|unresponsive|sudden confusion)\b",
            r"\b(seizure|convulsions|fits|daura padna)\b",
            r"\b(stroke symptoms|suspected stroke|lakwa)\b",
        ],
        "warning_en": (
            "Possible acute neurological emergency. "
            "Seek emergency medical care immediately."
        ),
        "warning_hi": (
            "स्ट्रोक या अन्य गंभीर न्यूरोलॉजिकल समस्या की आशंका है। "
            "तुरंत इमरजेंसी चिकित्सा सहायता लें।"
        ),
    },
    {
        "category": "severe_headache",
        "patterns": [
            r"\b(sudden worst headache|worst headache of my life)\b",
            r"\b(thunderclap headache|sudden explosive headache)\b",
            r"\b(sudden severe headache)\b",
        ],
        "warning_en": (
            "A sudden or extremely severe headache can indicate a serious "
            "medical condition. Seek emergency assessment immediately."
        ),
        "warning_hi": (
            "अचानक या अत्यधिक गंभीर सिरदर्द गंभीर समस्या का संकेत हो सकता है। "
            "तुरंत चिकित्सा जांच करवाएं।"
        ),
    },
    {
        "category": "severe_bleeding",
        "patterns": [
            r"\b(vomiting blood|blood in vomit|coughing up blood)\b",
            r"\b(uncontrolled bleeding|severe blood loss)\b",
            r"\b(khoon ki ulti|bahut khoon beh raha)\b",
        ],
        "warning_en": (
            "Potential serious bleeding detected. "
            "Seek immediate emergency medical attention."
        ),
        "warning_hi": (
            "गंभीर रक्तस्राव की आशंका है। "
            "तुरंत आपातकालीन चिकित्सा सहायता लें।"
        ),
    },
    {
        "category": "poisoning",
        "patterns": [
            r"\b(swallowed poison|consumed poison|swallowed chemical)\b",
            r"\b(chemical ingestion|overdose|drug overdose)\b",
            r"\b(consumed acid|ate poisonous substance)\b",
            r"\b(jahar kha liya|zahar pee liya)\b",
        ],
        "warning_en": (
            "Possible poisoning or overdose. "
            "Seek immediate emergency medical assistance. "
            "Do not induce vomiting unless instructed by professionals."
        ),
        "warning_hi": (
            "ज़हर या दवा की अधिक मात्रा लेने की आशंका है। "
            "तुरंत आपातकालीन चिकित्सा सहायता लें।"
        ),
    },
    {
        "category": "self_harm",
        "patterns": [
            r"\b(i want to kill myself|i will kill myself)\b",
            r"\b(i want to end my life|planning to commit suicide)\b",
            r"\b(suicidal thoughts|self harm attempt)\b",
            r"\b(aatmhatya karna chahta|aatmhatya karna chahti)\b",
        ],
        "warning_en": (
            "Immediate personal safety support is important. "
            "Contact emergency services and stay with a trusted person."
        ),
        "warning_hi": (
            "आपकी सुरक्षा सबसे महत्वपूर्ण है। "
            "तुरंत आपातकालीन सहायता लें और किसी भरोसेमंद व्यक्ति के साथ रहें।"
        ),
    },
]


# --------------------------------------------------
# URGENT MEDICAL ASSESSMENT RULES
# --------------------------------------------------

URGENT_RULES = [
    r"\b(persistent vomiting|continuous vomiting|repeated vomiting)\b",
    r"\b(new severe headache|rapidly worsening headache)\b",
    r"\b(head injury with vomiting|head injury with dizziness)\b",
    r"\b(severe dehydration|unable to keep fluids down)\b",
]


# --------------------------------------------------
# NEGATION DETECTION
# --------------------------------------------------

NEGATION_PATTERN = re.compile(
    r"\b(no|not|never|without|denies|don't|doesn't|"
    r"didn't|isn't|aren't|nahi|nahin|mat)\b",
    re.IGNORECASE,
)


class SafetyService:

    @staticmethod
    def _is_negated(text: str, match_start: int) -> bool:
        """
        Check whether a detected symptom is explicitly negated.
        Uses a small local context window.
        """

        prefix = text[max(0, match_start - 70):match_start]

        # Only consider text after the latest sentence boundary.
        prefix = re.split(
            r"[.!?;\n]",
            prefix
        )[-1]

        words = prefix.strip().split()

        # Restrict negation to nearby words.
        recent_context = " ".join(words[-6:])

        return bool(
            NEGATION_PATTERN.search(recent_context)
        )

    @staticmethod
    def _is_hindi(text: str) -> bool:

        hindi_markers = [
            "hai",
            "ho",
            "me",
            "mein",
            "ka",
            "ki",
            "dard",
            "saans",
            "nahi",
            "nahin",
            "raha",
            "rahi",
        ]

        return any(
            re.search(
                rf"\b{re.escape(word)}\b",
                text
            )
            for word in hindi_markers
        )

    @staticmethod
    def evaluate_emergency(
        text: str
    ) -> Tuple[bool, Optional[str], str]:
        """
        Returns:
            (is_emergency, emergency_message, urgency)

        Urgency values:
            emergency
            high
            low
        """

        if not text or not text.strip():

            return False, None, "low"

        text_lower = text.lower().strip()

        # 1. Check emergency rules first.

        for rule in EMERGENCY_RULES:

            for pattern in rule["patterns"]:

                for match in re.finditer(
                    pattern,
                    text_lower,
                    re.IGNORECASE
                ):

                    if SafetyService._is_negated(
                        text_lower,
                        match.start()
                    ):
                        continue

                    is_hindi = SafetyService._is_hindi(
                        text_lower
                    )

                    message = (
                        rule["warning_hi"]
                        if is_hindi
                        else rule["warning_en"]
                    )

                    return True, message, "emergency"

        # 2. Check urgent assessment rules.

        for pattern in URGENT_RULES:

            for match in re.finditer(
                pattern,
                text_lower,
                re.IGNORECASE
            ):

                if SafetyService._is_negated(
                    text_lower,
                    match.start()
                ):
                    continue

                return False, None, "high"

        return False, None, "low"

    # --------------------------------------------------
    # VULNERABLE POPULATION CHECK
    # --------------------------------------------------

    @staticmethod
    def evaluate_vulnerability(
        text: str,
        user_profile: Optional[Dict[str, Any]] = None
    ) -> List[str]:

        alerts = []

        text_lower = (text or "").lower()

        if re.search(
            r"\b(infant|newborn|baby|navjaat|chhota bachha)\b",
            text_lower
        ):

            alerts.append(
                "Pediatric safety notice: Infants and young children "
                "require age-appropriate medical assessment. "
                "Do not administer herbal products without pediatric advice."
            )

        if re.search(
            r"\b(pregnant|pregnancy|garbh|garbhavastha)\b",
            text_lower
        ):

            alerts.append(
                "Pregnancy safety notice: Herbal supplements, fasting, "
                "and intensive yoga require prior medical clearance "
                "from a qualified obstetrician."
            )

        if user_profile:

            age = user_profile.get("age")

            try:

                if age is not None:

                    age = int(age)

                    if age < 12:

                        alerts.append(
                            "Pediatric user: Medical assessment and "
                            "age-appropriate treatment are important. "
                            "Do not use adult dosages."
                        )

                    elif age >= 65:

                        alerts.append(
                            "Older adult safety notice: Review medications, "
                            "blood pressure and potential treatment interactions "
                            "with a qualified healthcare professional."
                        )

            except (ValueError, TypeError):

                pass

        return alerts

    # --------------------------------------------------
    # STANDARD EMERGENCY RESPONSE
    # --------------------------------------------------

    @staticmethod
    def get_emergency_response_block(
        warning_msg: str
    ) -> Dict[str, Any]:

        return {
            "status": "emergency_intercepted",

            "is_emergency": True,

            "emergency_message": warning_msg,

            "urgency": "emergency",

            "recommendations": [
                "Call emergency medical services immediately. In India, call 112.",
                "Do not attempt self-treatment or Ayurvedic remedies for emergency symptoms.",
                "Have someone stay with the affected person until medical help arrives.",
                "Do not drive yourself if you are seriously unwell."
            ],

            "disclaimer": (
                "CRITICAL MEDICAL ALERT: Immediate professional evaluation "
                "is required. Do not delay emergency medical care."
            )
        }
