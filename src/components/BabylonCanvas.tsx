import { Engine, Mesh } from "@babylonjs/core";
import { FC, RefObject, useEffect, useRef, useState } from "react";
import { getScene } from "../core/scene";
import { OutlinePass } from "../core/postprocess/outlinePass";
import { CompactPicker } from "react-color";

interface BabylonCanvasProps {}

const BabylonCanvas: FC<BabylonCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outlinePassRef = useRef<OutlinePass | null>(null);
  const {
    visibleColor,
    setVisibleColor,
    hiddenColor,
    setHiddenColor,
    setIsVisibleDisplayed,
    setIsHiddenDisplayed,
    isVisibleDisplayed,
    isHiddenDisplayed,
    thickness,
    setThickness,
  } = useOptions(outlinePassRef);
  useScene(canvasRef, outlinePassRef);

  return (
    <>
      <canvas
        style={{ width: "100%", height: "100%" }}
        ref={canvasRef}
      ></canvas>
      <main
        style={{
          fontFamily: "Roboto",
          position: "fixed",
          top: 0,
          right: 0,
          background: "rgba(0,0,0,0.9)",
          borderLeft: "1px solid white",
          borderBottomLeftRadius: "0.5rem",
          padding: "1rem",
        }}
      >
        <h1>Visible Edge</h1>
        <CompactPicker
          color={visibleColor}
          onChange={(e) => setVisibleColor(e.hex)}
        />
        <br />
        <h1>Hidden Edge</h1>
        <CompactPicker
          color={hiddenColor}
          onChange={(e) => setHiddenColor(e.hex)}
        />
        <br />
        <h1>Thickness:</h1>
        <input
          value={thickness*thickness}
          onChange={(e) => {
            setThickness(Math.sqrt(+e.target.value));
          }}
          style={{ width: "100%" }}
          type="range"
          min={0}
          max={900}
        />
        <h1>Display:</h1>
        <h2>
          Visible Edge{" "}
          <input
            style={{ width: "2rem", height: "2rem" }}
            checked={isVisibleDisplayed}
            onChange={(e) => {
              setIsVisibleDisplayed(e.target.checked);
            }}
            type="checkbox"
          />
        </h2>
        <h2>
          Hidden Edge{" "}
          <input
            style={{ width: "2rem", height: "2rem" }}
            checked={isHiddenDisplayed}
            onChange={(e) => {
              setIsHiddenDisplayed(e.target.checked);
            }}
            type="checkbox"
          />
        </h2>
      </main>
    </>
  );
};

export default BabylonCanvas;

const useScene = (
  canvasRef: RefObject<HTMLCanvasElement>,
  outlinePassRef: RefObject<OutlinePass | null>
) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new Engine(canvas, true);
    const scene = getScene(engine, outlinePassRef);

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(() => engine.resize(), 15);
    });
    resizeObserver.observe(canvas);

    engine.runRenderLoop(() => {
      scene.render();
    });

    canvasRef.current.onpointermove = () => {
      const result = scene.pick(scene.pointerX, scene.pointerY);
      if (!outlinePassRef.current) return;
      if (!result.hit) {
        outlinePassRef.current.setSelectedObjects([]);
        return;
      }
      const pickedMesh = result.pickedMesh;
      outlinePassRef.current.only(pickedMesh as Mesh);
    };

    return () => {
      resizeObserver.disconnect();
      engine.stopRenderLoop();
      engine.dispose();
    };
  }, [canvasRef, outlinePassRef]);
};

const useOptions = (outlinePassRef: RefObject<OutlinePass | null>) => {
  const [visibleColor, setVisibleColor] = useState("#FF0000");
  const [hiddenColor, setHiddenColor] = useState("#00FFFF");
  const [isVisibleDisplayed, setIsVisibleDisplayed] = useState(true);
  const [isHiddenDisplayed, setIsHiddenDisplayed] = useState(true);
  const [thickness, setThickness] = useState(5);

  useEffect(() => {
    if (!outlinePassRef.current) return;
    outlinePassRef.current.setVisibleColor(visibleColor);
  }, [outlinePassRef, visibleColor]);

  useEffect(() => {
    if (!outlinePassRef.current) return;
    outlinePassRef.current.setHiddenColor(hiddenColor);
  }, [hiddenColor, outlinePassRef]);

  useEffect(() => {
    if (!outlinePassRef.current) return;
    outlinePassRef.current.isVisibleDisplayed = isVisibleDisplayed;
  }, [isVisibleDisplayed, outlinePassRef]);

  useEffect(() => {
    if (!outlinePassRef.current) return;
    outlinePassRef.current.isHiddenDisplayed = isHiddenDisplayed;
  }, [isHiddenDisplayed, outlinePassRef]);

  useEffect(() => {
    if (!outlinePassRef.current) return;
    outlinePassRef.current.thickness = thickness;
  }, [thickness, outlinePassRef]);

  return {
    visibleColor,
    setVisibleColor,
    hiddenColor,
    setHiddenColor,
    setIsVisibleDisplayed,
    setIsHiddenDisplayed,
    isVisibleDisplayed,
    isHiddenDisplayed,
    thickness,
    setThickness,
  };
};
