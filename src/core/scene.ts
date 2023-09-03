import {
  Color3,
  Color4,
  Engine,
  Scene,
  Vector3,
  CreateSphere,
  StandardMaterial,
  ArcRotateCamera,
  SceneLoader,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { toRadian } from "./utils";
import { applyPost } from "./postprocess/postProcess";
import { OutlinePass } from "./postprocess/outlinePass";
import { MutableRefObject } from "react";
import "@babylonjs/loaders/OBJ/objFileLoader";

export const getScene = (
  engine: Engine,
  outlinePassRef: MutableRefObject<OutlinePass | null>
) => {
  const scene = new Scene(engine);
  scene.createDefaultLight();

  const fogColor = [14 / 255, 16 / 255, 24 / 255];
  scene.clearColor = new Color4(0.0, 0.0, 0.0, 0.0);
  scene.fogMode = Scene.FOGMODE_LINEAR;
  scene.fogColor = new Color3(...fogColor);
  scene.fogDensity = 1.0;
  scene.fogStart = 3;
  scene.fogEnd = 50;

  const camera = new ArcRotateCamera(
    "camera",
    toRadian(-90),
    toRadian(60),
    30,
    new Vector3(0, 0, 0)
  );
  camera.attachControl(true);
  camera.rotation.set(0, toRadian(90), 0);
  camera.minZ = 0.001;
  camera.fov = toRadian(60);

  outlinePassRef.current = new OutlinePass(camera, scene, engine);

  spawnSpheres(scene, 20, 0.7, {
    min: 3,
    variance: 6,
  });

  SceneLoader.Append("/", "tree.obj", scene, (scene) => {
    scene.meshes[scene.meshes.length - 1].scaling.x = 15;
    scene.meshes[scene.meshes.length - 1].scaling.y = 15;
    scene.meshes[scene.meshes.length - 1].scaling.z = 15;
  });

  applyPost(camera, scene, engine);

  scene.setRenderingAutoClearDepthStencil(1, false);
  return scene;
};

const spawnSpheres = (
  scene: Scene,
  count = 20,
  density = 1,
  diameter = { min: 3, variance: 3 }
) => {
  density = density || 0.000_000_001;
  density /= 10;

  for (let i = 0; i < count; i++) {
    const sphere = CreateSphere(
      `sphere${i}`,
      { diameter: diameter.min + Math.random() * diameter.variance },
      scene
    );

    const getRandomPosition = () => (Math.random() - 0.5) / density;

    sphere.position.x = getRandomPosition();
    sphere.position.y = getRandomPosition();
    sphere.position.z = getRandomPosition();

    const getRandomColor = () => 0.4 + Math.random() / 2;

    const mat = new StandardMaterial(`spheremat${i}`, scene);
    mat.diffuseColor = new Color3(
      getRandomColor(),
      getRandomColor(),
      getRandomColor()
    );

    sphere.material = mat;
  }
};
