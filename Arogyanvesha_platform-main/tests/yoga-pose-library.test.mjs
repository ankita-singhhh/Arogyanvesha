import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const poseSource = await readFile(
  path.join(projectRoot, "src", "lib", "yogaPoses.ts"),
  "utf8",
);
const expectedPoses = [
  "tadasana",
  "vrikshasana",
  "trikonasana",
  "virabhadrasana-ii",
  "adho-mukha-svanasana",
  "bhujangasana",
  "balasana",
  "setu-bandhasana",
];

test("all eight pose references are distinct local images with attribution and guidance", async () => {
  const imagePaths = new Set();
  for (const id of expectedPoses) {
    const start = poseSource.indexOf(`id: "${id}"`);
    assert.notEqual(start, -1, `${id} must be present in the pose library`);
    const end = poseSource.indexOf("\n  },", start);
    const pose = poseSource.slice(start, end === -1 ? undefined : end);
    const image = pose.match(/image: "([^"]+)"/)?.[1];
    assert.ok(image, `${id} must have a reference image`);
    assert.ok(pose.match(/imageAlt: "[^"]{20,}"/), `${id} must have descriptive alt text`);
    assert.ok(pose.match(/imageSource: "https:\/\/commons\.wikimedia\.org\/wiki\/File:/), `${id} must identify its source`);
    assert.ok(pose.match(/imageCredit: "[^"]+"/), `${id} must identify its photographer`);
    assert.ok(pose.match(/imageLicense: "CC BY/), `${id} must include a reuse license`);
    assert.ok(pose.match(/imageLicenseUrl: "https:\/\/creativecommons\.org\//), `${id} must link its license`);
    for (const field of [
      "sanskrit",
      "english",
      "difficulty",
      "summary",
      "benefits",
      "instructions",
      "alignment",
      "breathing",
      "holdSeconds",
      "holdLabel",
      "exit",
      "modification",
      "cautions",
      "cameraView",
      "visibleLandmarks",
    ]) {
      assert.match(pose, new RegExp(`${field}:`), `${id} must include ${field}`);
    }

    assert.ok(image.startsWith("/images/yoga/poses/"), `${id} should use a local photo`);
    assert.ok(!imagePaths.has(image), `${id} must not reuse another pose's image`);
    imagePaths.add(image);
    const imagePath = path.join(projectRoot, "public", image.slice(1));
    const imageInfo = await stat(imagePath);
    assert.ok(imageInfo.size > 20_000, `${id} reference image should not be empty`);
    const bytes = await readFile(imagePath);
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
    const isPng =
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47;
    assert.ok(isJpeg || isPng, `${id} must be a readable JPEG or PNG`);
  }
  assert.equal(imagePaths.size, expectedPoses.length);
});
