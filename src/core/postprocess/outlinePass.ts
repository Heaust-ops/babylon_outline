import {
  Camera,
  Color3,
  Effect,
  Engine,
  Mesh,
  PostProcess,
  RenderTargetTexture,
  Scene,
} from "@babylonjs/core";
import outlineShader from "../frags/outline.frag";
import { hexToRgb } from "../utils";

export class OutlinePass {
  thickness: number;
  visibleColor: Color3;
  hiddenColor: Color3;
  private _isVisibleDisplayed: number;
  private _isHiddenDisplayed: number;
  private selectedObjects: Mesh[];
  private camera: Camera;
  private engine: Engine;
  private maskTexture: RenderTargetTexture;
  private scene: Scene;

  constructor(camera: Camera, scene: Scene, engine: Engine) {
    this.selectedObjects = [];
    this.thickness = 5;
    this.visibleColor = new Color3(...hexToRgb("#FF0000"));
    this.hiddenColor = new Color3(...hexToRgb("#00FFFF"));
    this._isVisibleDisplayed = 1;
    this._isHiddenDisplayed = 1;
    //
    this.camera = camera;
    this.engine = engine;
    this.scene = scene;
    //
    this.selectedObjects = [];
    //
    const engineDimensions = {
      width: engine.getRenderWidth(),
      height: engine.getRenderHeight(),
    };

    this.maskTexture = new RenderTargetTexture(
      "maskTexture",
      engineDimensions,
      this.scene
    );

    this.apply();
  }

  get isVisibleDisplayed() {
    return !!this._isVisibleDisplayed;
  }

  get isHiddenDisplayed() {
    return !!this._isHiddenDisplayed;
  }

  set isVisibleDisplayed(flag: boolean) {
    this._isVisibleDisplayed = +flag;
  }

  set isHiddenDisplayed(flag: boolean) {
    this._isHiddenDisplayed = +flag;
  }

  setVisibleColor(hex: string) {
    this.visibleColor = new Color3(...hexToRgb(hex));
  }

  setHiddenColor(hex: string) {
    this.hiddenColor = new Color3(...hexToRgb(hex));
  }

  add(mesh: Mesh) {
    this.setSelectedObjects([...this.getSelectedObjects(), mesh]);
  }

  remove(meshOrId: string | Mesh) {
    const meshId = typeof meshOrId === "string" ? meshOrId : meshOrId.id;
    this.setSelectedObjects(
      this.getSelectedObjects().filter((mesh) => mesh.id !== meshId)
    );
  }

  only(mesh: Mesh) {
    this.setSelectedObjects([mesh]);
  }

  getSelectedObjects() {
    return this.selectedObjects.slice();
  }

  setSelectedObjects(meshes: Mesh[]) {
    this.selectedObjects = meshes;
    const selectedIds = this.selectedObjects.map((mesh) => mesh.id);
    this.scene.meshes.forEach((mesh) => {
      if (selectedIds.includes(mesh.id)) mesh.renderingGroupId = 1;
      else mesh.renderingGroupId = 0;
    });
    this.maskTexture.renderList = this.selectedObjects;
  }

  private apply() {
    this.scene.customRenderTargets.push(this.maskTexture);

    Effect.ShadersStore["outlineFragmentShader"] = outlineShader;
    const postProcess = new PostProcess(
      "Outline Shader",
      "outline",
      [
        "screenSize",
        "visibleEdgeColor",
        "hiddenEdgeColor",
        "outlineThickness",
        "isVisibleDisplayed",
        "isHiddenDisplayed",
      ],
      ["maskTexture"],
      1.0,
      this.camera,
      undefined,
      this.engine
    );

    postProcess.onApply = (effect) => {
      effect.setFloat2("screenSize", postProcess.width, postProcess.height);
      effect.setFloat("outlineThickness", this.thickness);
      effect.setInt("isVisibleDisplayed", this._isVisibleDisplayed);
      effect.setInt("isHiddenDisplayed", this._isHiddenDisplayed);
      effect.setColor3("visibleEdgeColor", this.visibleColor);
      effect.setColor3("hiddenEdgeColor", this.hiddenColor);
      effect.setTexture("maskTexture", this.maskTexture);
    };
  }
}
