import { redirect } from "next/navigation";

/** Legacy route: a result URL is created only after a successful analysis. */
export default function SkinAnalyzingPage() {
  redirect("/skin/capture");
}
