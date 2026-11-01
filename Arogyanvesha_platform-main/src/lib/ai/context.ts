import { supabase } from "@/lib/supabase";
import { getRitu } from "./prompts";

export async function buildUserContext(userId: string): Promise<string> {
  try {
    // 1. Fetch user base metrics
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("plan, current_streak, name")
      .eq("id", userId)
      .single();
    if (userError) console.error("Error fetching user profile context:", userError);

    // 2. Fetch latest Prakriti result
    const { data: prakriti, error: prakritiError } = await supabase
      .from("prakriti_results")
      .select("vata_pct, pitta_pct, kapha_pct, primary_dosha, secondary_dosha")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (prakritiError) console.error("Error fetching user prakriti context:", prakritiError);

    // 3. Fetch latest health score
    const { data: health, error: healthError } = await supabase
      .from("health_scores")
      .select("overall")
      .eq("user_id", userId)
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (healthError) console.error("Error fetching user health score context:", healthError);

    // 4. Inject current season context
    const currentMonth = new Date().getMonth();
    const season = getRitu(currentMonth);

    let context = `User Profile Context:
- User Name: ${user?.name || "Arogya seeker"}
- Subscription Plan: ${user?.plan || "free"}
- Current Streak: ${user?.current_streak || 0} days
- Current Season (Ayurveda Ritu): ${season.name}. ${season.description}
`;

    if (prakriti) {
      context += `- Prakriti Composition: Vata ${prakriti.vata_pct}%, Pitta ${prakriti.pitta_pct}%, Kapha ${prakriti.kapha_pct}%
- Dominant Dosha: ${prakriti.primary_dosha.toUpperCase()} (Secondary: ${prakriti.secondary_dosha.toUpperCase()})
`;
    } else {
      context += `- Prakriti: Not yet completed. (Recommend taking the assessment)
`;
    }

    if (health) {
      context += `- Latest Overall Arogya Health Score: ${health.overall}/100
`;
    }

    return context;
  } catch (error) {
    console.error("Error building AI user context:", error);
    return "User Profile Context: Limited data available.";
  }
}
