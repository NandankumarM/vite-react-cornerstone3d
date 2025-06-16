import { useEffect, useRef } from "react";
import createImageIdsAndCacheMetaData from "./lib/createImageIdsAndCacheMetaData";
import {
  RenderingEngine,
  Enums,
  type Types,
  volumeLoader,
  cornerstoneStreamingImageVolumeLoader,
} from "@cornerstonejs/core";
import { init as csRenderInit } from "@cornerstonejs/core";
import { init as csToolsInit, addTool, ToolGroupManager } from "@cornerstonejs/tools";
import { CrosshairsTool ,BrushTool} from "@cornerstonejs/tools";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";

volumeLoader.registerUnknownVolumeLoader(cornerstoneStreamingImageVolumeLoader);

function App() {
  const axialRef = useRef<HTMLDivElement>(null);
  const sagittalRef = useRef<HTMLDivElement>(null);
  const coronalRef = useRef<HTMLDivElement>(null);
  const running = useRef(false);

  useEffect(() => {
    const setup = async () => {
      if (running.current) {
        return;
      }
      running.current = true;

      // Initialize Core and Tools
      await csRenderInit();
      await csToolsInit();
      dicomImageLoaderInit({ maxWebWorkers: 1 });

      // Add and configure Crosshairs Tool
      addTool(CrosshairsTool);

      // Fetch Cornerstone imageIds and metadata
      const imageIds = await createImageIdsAndCacheMetaData({
        StudyInstanceUID:
          "1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463",
        SeriesInstanceUID:
          "1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561",
        wadoRsRoot: "https://d3t6nz73ql33tx.cloudfront.net/dicomweb",
      });

      // Create the rendering engine
      const renderingEngineId = "mprRenderingEngine";
      const renderingEngine = new RenderingEngine(renderingEngineId);

      // Volume ID
      const volumeId = "mprStreamingImageVolume";
      const volume = await volumeLoader.createAndCacheVolume(volumeId, {
        imageIds,
      });

      // Load the volume data
      await volume.load();

      // Viewport configuration
      const viewports = [
        {
          viewportId: "axialViewport",
          type: Enums.ViewportType.ORTHOGRAPHIC,
          element: axialRef.current,
          defaultOptions: {
            orientation: Enums.OrientationAxis.AXIAL,
          },
        },
        {
          viewportId: "sagittalViewport",
          type: Enums.ViewportType.ORTHOGRAPHIC,
          element: sagittalRef.current,
          defaultOptions: {
            orientation: Enums.OrientationAxis.SAGITTAL,
          },
        },
        {
          viewportId: "coronalViewport",
          type: Enums.ViewportType.ORTHOGRAPHIC,
          element: coronalRef.current,
          defaultOptions: {
            orientation: Enums.OrientationAxis.CORONAL,
          },
        },
      ];

      // Enable viewports
      viewports.forEach((viewportInput) => {
        renderingEngine.enableElement(viewportInput);
      });

      // Set volume for each viewport
      viewports.forEach(({ viewportId }) => {
        const viewport = renderingEngine.getViewport(viewportId) as Types.IVolumeViewport;
        viewport.setVolumes([{ volumeId }]);
        viewport.render();
      });

      // Create and configure ToolGroup
      const toolGroupId = "mprToolGroup";
      const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

      // Add tools to the tool group
      toolGroup.addTool(CrosshairsTool.toolName);
      addTool(BrushTool.toolName);

      // Set the tool group for all viewports
      viewports.forEach(({ viewportId }) => {
        toolGroup.addViewport(viewportId, renderingEngineId);
      });

      // Activate the CrosshairsTool
     // toolGroup.setToolActive(CrosshairsTool.toolName, {
      //  bindings: [{ mouseButton: 1 }],
      //});

      toolGroup.setToolActive(BrushTool.toolName, {
        bindings: [{ mouseButton: 1 }],
      });

    };

    setup();

    return () => {
      // Cleanup resources if needed
      //const renderingEngine = RenderingEngine.getRenderingEngine("mprRenderingEngine");
      //renderingEngine?.destroy();
    };
  }, []);

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <div
        ref={axialRef}
        style={{
          width: "256px",
          height: "256px",
          backgroundColor: "#000",
        }}
      ></div>
      <div
        ref={sagittalRef}
        style={{
          width: "256px",
          height: "256px",
          backgroundColor: "#000",
        }}
      ></div>
      <div
        ref={coronalRef}
        style={{
          width: "256px",
          height: "256px",
          backgroundColor: "#000",
        }}
      ></div>
    </div>
  );
}

export default App;