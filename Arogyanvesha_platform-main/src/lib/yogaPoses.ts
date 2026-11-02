export type PoseId =
  | "tadasana"
  | "vrikshasana"
  | "trikonasana"
  | "virabhadrasana-ii"
  | "adho-mukha-svanasana"
  | "bhujangasana"
  | "balasana"
  | "setu-bandhasana";

export type YogaPoseDefinition = {
  id: PoseId;
  sanskrit: string;
  english: string;
  difficulty: "Beginner" | "Beginner-friendly";
  image: string;
  imageAlt: string;
  imageSource: string;
  imageCredit: string;
  imageLicense: string;
  imageLicenseUrl: string;
  summary: string;
  benefits: string;
  instructions: string[];
  alignment: string;
  breathing: string;
  holdSeconds: number;
  holdLabel: string;
  exit: string;
  modification: string;
  cautions: string;
  cameraView: string;
  visibleLandmarks: string;
};

export const YOGA_POSES: YogaPoseDefinition[] = [
  {
    id: "tadasana",
    sanskrit: "Tadasana",
    english: "Mountain Pose",
    difficulty: "Beginner",
    image: "/images/yoga/poses/tadasana.jpg",
    imageAlt: "A person standing tall in Tadasana with feet grounded and arms resting by the sides.",
    imageSource: "https://commons.wikimedia.org/wiki/File:Mr-yoga-mountain-pose-1.jpg",
    imageCredit: "Mr. Yoga",
    imageLicense: "CC BY-SA 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    summary: "A steady standing pose for noticing balance and an upright posture.",
    benefits: "Traditionally practised to develop body awareness, steadiness, and a comfortable sense of upright posture.",
    instructions: [
      "Stand with your feet parallel and about hip-width apart; keep a wall or chair nearby if helpful.",
      "Spread your weight across both feet and let your arms rest by your sides.",
      "Soften your knees, lengthen gently through the crown of your head, and relax your jaw.",
    ],
    alignment: "Keep both knees soft rather than locked. Let your shoulders sit over your hips and keep your head comfortably above your chest.",
    breathing: "Breathe easily through your nose if comfortable. Let each exhale soften your shoulders without forcing a breath.",
    holdSeconds: 30,
    holdLabel: "30 seconds",
    exit: "Bend your knees slightly, take a comfortable breath, and step or sit down if you feel unsteady.",
    modification: "Practise seated in a sturdy chair, or stand with your back near a wall and one hand on a chair.",
    cautions: "Use support if balance is uncertain. Stop and sit if you feel dizzy or uncomfortable.",
    cameraView: "Face the camera, with your full body and both feet visible.",
    visibleLandmarks: "Both shoulders, hips, knees, and ankles",
  },
  {
    id: "vrikshasana",
    sanskrit: "Vrikshasana",
    english: "Tree Pose",
    difficulty: "Beginner-friendly",
    image: "/images/yoga/poses/vrikshasana.png",
    imageAlt: "A person balancing in Tree Pose with one foot resting on the inner thigh, away from the knee.",
    imageSource: "https://commons.wikimedia.org/wiki/File:Tree_pose_at_home.png",
    imageCredit: "Plankfad",
    imageLicense: "CC BY-SA 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    summary: "A supported single-leg balance with options to keep the lifted foot low.",
    benefits: "Traditionally used to practise balance, focus, and steady standing.",
    instructions: [
      "Stand near a wall or chair and place your weight on one foot.",
      "Turn the other knee out and rest that foot at your ankle or inner calf; avoid pressing it into the knee.",
      "Keep your gaze on a still point. Bring your hands together at your chest or reach them overhead if comfortable.",
    ],
    alignment: "Keep the standing knee soft and the pelvis level. Press the foot and leg gently into one another without forcing the hip open.",
    breathing: "Keep breathing smoothly. Lower the lifted foot whenever you need to regain balance.",
    holdSeconds: 20,
    holdLabel: "20 seconds per side",
    exit: "Bring your hands to your chest, lower the lifted foot slowly, and pause before changing sides.",
    modification: "Keep the lifted toes on the floor like a kickstand, hold a chair, or practise seated with one heel lightly raised.",
    cautions: "Skip the balance if it feels unsafe. Avoid placing the lifted foot directly against the knee or forcing the hip outward.",
    cameraView: "Face the camera and keep both legs, feet, and hands in view.",
    visibleLandmarks: "Both shoulders, hips, knees, and ankles; arms and wrists are optional",
  },
  {
    id: "trikonasana",
    sanskrit: "Trikonasana",
    english: "Triangle Pose",
    difficulty: "Beginner-friendly",
    image: "/images/yoga/poses/trikonasana.jpg",
    imageAlt: "A person performing Triangle Pose with a wide stance, one hand supported on a block, and the other arm raised.",
    imageSource: "https://commons.wikimedia.org/wiki/File:Uttitha_Trikonasana.jpg",
    imageCredit: "Matthew Greenfield",
    imageLicense: "CC BY-SA 3.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    summary: "A wide standing side reach with a long, comfortable spine.",
    benefits: "Traditionally practised as a standing side stretch and an opportunity to explore a broad, steady stance.",
    instructions: [
      "Step your feet apart to a comfortable width and turn one foot outward.",
      "Reach both arms out from your shoulders. Keep both legs long but do not lock your knees.",
      "Hinge gently over the turned-out leg and rest your lower hand on a block, chair, or leg; reach the other hand upward.",
    ],
    alignment: "Keep the chest open and both sides of the waist long. Rest your hand above the knee rather than pressing on the knee joint.",
    breathing: "Breathe steadily and make the side reach smaller if breathing becomes strained.",
    holdSeconds: 20,
    holdLabel: "20 seconds per side",
    exit: "Press through both feet, bring your torso upright with control, and turn your feet parallel before changing sides.",
    modification: "Shorten your stance and place your lower hand on a chair or block. A seated side reach is another option.",
    cautions: "Do not force a deep side bend. Use a smaller range or skip the pose if it causes pain or dizziness.",
    cameraView: "Face the camera at a slight angle; keep both arms, hips, knees, and feet in frame.",
    visibleLandmarks: "Both shoulders, elbows, wrists, hips, knees, and ankles",
  },
  {
    id: "virabhadrasana-ii",
    sanskrit: "Virabhadrasana II",
    english: "Warrior II",
    difficulty: "Beginner-friendly",
    image: "/images/yoga/poses/virabhadrasana-ii.jpg",
    imageAlt: "A person in Warrior II with a wide stance, front knee bent, back leg long, and arms extended.",
    imageSource: "https://commons.wikimedia.org/wiki/File:Virabhadrasana_II_-_Warrior_II_Pose.jpg",
    imageCredit: "lululemon athletica",
    imageLicense: "CC BY 2.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    summary: "A wide standing pose with one knee bent and the arms reaching in opposite directions.",
    benefits: "Traditionally practised to explore a stable stance, leg strength, and attention to alignment.",
    instructions: [
      "Stand with your feet wide apart. Turn one foot outward and angle the other foot slightly inward.",
      "Bend the front knee only as far as comfortable, keeping it pointed in the same direction as the toes.",
      "Reach your arms out at shoulder height and look over the front hand if that feels comfortable.",
    ],
    alignment: "Keep the front knee tracking toward the toes rather than collapsing inward. Keep your torso upright and shoulders relaxed.",
    breathing: "Use an even, comfortable breath. Make the stance shorter or straighten the front leg if breathing feels difficult.",
    holdSeconds: 20,
    holdLabel: "20 seconds per side",
    exit: "Straighten the front leg gently, turn both feet parallel, and step your feet together when ready.",
    modification: "Shorten your stance, keep the front knee less bent, or practise beside a chair for support.",
    cautions: "Avoid forcing the knee bend or stance width. Stop if you feel sharp pain, instability, or dizziness.",
    cameraView: "Face the camera with your feet wide; keep both legs, arms, and hands visible.",
    visibleLandmarks: "Both shoulders, elbows, wrists, hips, knees, and ankles",
  },
  {
    id: "adho-mukha-svanasana",
    sanskrit: "Adho Mukha Svanasana",
    english: "Downward-Facing Dog",
    difficulty: "Beginner-friendly",
    image: "/images/yoga/poses/adho-mukha-svanasana.jpg",
    imageAlt: "A person in Downward-Facing Dog with hands and feet grounded and hips lifted.",
    imageSource: "https://commons.wikimedia.org/wiki/File:Downward-Facing-Dog.JPG",
    imageCredit: "Iveto",
    imageLicense: "CC BY 3.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    summary: "An inverted V-shaped pose that can be practised with bent knees.",
    benefits: "Often used in yoga practice to explore shoulder and leg mobility; individual comfort and range vary.",
    instructions: [
      "Begin on hands and knees with hands under shoulders and knees under hips.",
      "Tuck your toes and lift your hips up and back, making an inverted V shape.",
      "Press through your hands and let your knees stay bent if that helps keep your back long.",
    ],
    alignment: "Spread your fingers, keep your neck relaxed, and avoid forcing your heels to the floor. Your back can matter more than straight legs.",
    breathing: "Take slow, easy breaths. Come down to hands and knees if you cannot breathe comfortably.",
    holdSeconds: 20,
    holdLabel: "20 seconds",
    exit: "Lower both knees to the floor with control, then rest in a comfortable kneeling or seated position.",
    modification: "Keep your knees bent, place your hands on a stable chair or wall, or use a shorter stance.",
    cautions: "Use care with wrist, shoulder, or back discomfort. Skip the pose if weight-bearing through your hands is not comfortable.",
    cameraView: "Turn sideways to the camera and keep your hands, hips, knees, and feet visible.",
    visibleLandmarks: "One clear side: shoulder, elbow, wrist, hip, knee, and ankle",
  },
  {
    id: "bhujangasana",
    sanskrit: "Bhujangasana",
    english: "Cobra Pose",
    difficulty: "Beginner-friendly",
    image: "/images/yoga/poses/bhujangasana.jpg",
    imageAlt: "A person lying face down in Cobra Pose with the chest gently lifted and legs extended.",
    imageSource: "https://commons.wikimedia.org/wiki/File:Bhujangasana,_Heinz_Grill_1992.jpg",
    imageCredit: "Martin Sinzinger",
    imageLicense: "CC BY-SA 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    summary: "A gentle prone backbend in which the chest lifts while the pelvis stays grounded.",
    benefits: "Traditionally practised to explore gentle spinal extension and the movement of the chest and shoulders.",
    instructions: [
      "Lie on your front with your legs relaxed behind you and the tops of your feet resting on the floor.",
      "Place your hands under or just ahead of your shoulders, keeping your elbows close to your sides.",
      "Press lightly through your hands and lift your chest only a little; keep the pelvis and lower body grounded.",
    ],
    alignment: "Keep the back of your neck long and shoulders away from your ears. Use your back muscles; do not push into a painful range.",
    breathing: "Breathe easily without holding your breath. Lower the chest if the breath becomes restricted.",
    holdSeconds: 15,
    holdLabel: "15 seconds",
    exit: "Lower your chest slowly, turn your head to one side, and rest before rolling onto your side.",
    modification: "Try a very low lift with hands farther forward, or keep your chest down and gently draw the shoulders back.",
    cautions: "Avoid a deep backbend. Skip the pose if lying on your front or extending your back is uncomfortable; seek qualified advice for an injury.",
    cameraView: "Turn sideways to the camera and keep your upper body, hands, hips, knees, and ankles in view.",
    visibleLandmarks: "One clear side: shoulder, elbow, wrist, hip, knee, and ankle",
  },
  {
    id: "balasana",
    sanskrit: "Balasana",
    english: "Child's Pose",
    difficulty: "Beginner",
    image: "/images/yoga/poses/balasana.jpg",
    imageAlt: "A person resting in Child's Pose with hips toward the heels and forehead supported on a mat.",
    imageSource: "https://commons.wikimedia.org/wiki/File:Hatha_yoga_child_pose.jpg",
    imageCredit: "Daniel Case",
    imageLicense: "CC BY-SA 3.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    summary: "A kneeling resting shape with several options for supporting the knees and head.",
    benefits: "Often used as a resting position during yoga practice; comfort depends on the individual and the chosen support.",
    instructions: [
      "Begin on hands and knees, then bring your big toes toward one another.",
      "Ease your hips back toward your heels only as far as comfortable, with knees together or apart.",
      "Rest your forehead on the floor, a folded blanket, or a block; let your arms rest forward or beside you.",
    ],
    alignment: "Let your back soften and keep your jaw relaxed. A supported head and a smaller knee bend are both valid options.",
    breathing: "Breathe naturally into your back and sides. Come out if the position makes breathing feel restricted.",
    holdSeconds: 30,
    holdLabel: "30 seconds",
    exit: "Walk your hands back toward your body and rise slowly to hands and knees; pause before standing.",
    modification: "Place a folded blanket under your knees or between your thighs and calves, and support your forehead on a cushion or block.",
    cautions: "Do not force the hips toward the heels. Use another resting position if kneeling, bending the knees, or folding forward causes discomfort.",
    cameraView: "Turn sideways to the camera and keep your shoulder, hip, knee, and ankle visible.",
    visibleLandmarks: "One clear side: shoulder, hip, knee, ankle, and wrist",
  },
  {
    id: "setu-bandhasana",
    sanskrit: "Setu Bandhasana",
    english: "Bridge Pose",
    difficulty: "Beginner-friendly",
    image: "/images/yoga/poses/setu-bandhasana.jpg",
    imageAlt: "A person lying on their back in Bridge Pose with knees bent and hips gently lifted.",
    imageSource: "https://commons.wikimedia.org/wiki/File:Setubandhasana_oblique_view.JPG",
    imageCredit: "Biswarup Ganguly",
    imageLicense: "CC BY 3.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    summary: "A supine pose with bent knees and a gentle, controlled lift of the hips.",
    benefits: "Traditionally practised to explore hip extension and a comfortable front-body opening.",
    instructions: [
      "Lie on your back with knees bent and feet flat, about hip-width apart.",
      "Rest your arms beside you and press evenly through your feet.",
      "Lift your hips a small, comfortable amount while keeping your knees pointing forward.",
    ],
    alignment: "Keep your neck still and your weight across both feet and shoulders. Do not turn your head while your hips are lifted.",
    breathing: "Keep your breath easy and steady; lower your hips if you feel pressure or strain.",
    holdSeconds: 20,
    holdLabel: "20 seconds",
    exit: "Lower your spine and hips slowly to the floor, then rest with your knees bent.",
    modification: "Lift the hips only slightly, or place a stable yoga block under the pelvis for a supported version.",
    cautions: "Avoid pressing into the neck or forcing the lift. Stop if you feel neck, back, or knee pain.",
    cameraView: "Turn sideways to the camera and keep your shoulder, hip, knee, and ankle visible.",
    visibleLandmarks: "One clear side: shoulder, hip, knee, and ankle",
  },
];

export function getYogaPose(id: string): YogaPoseDefinition | undefined {
  return YOGA_POSES.find((pose) => pose.id === id);
}
