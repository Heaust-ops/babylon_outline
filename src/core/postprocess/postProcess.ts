import {
  Camera,
  Engine,
  FxaaPostProcess,
  Scene,
} from "@babylonjs/core";

export const applyPost = (camera: Camera, _: Scene, engine: Engine) => {
  //
  new FxaaPostProcess("fxaa", 1.0, camera, undefined, engine, true);
};
