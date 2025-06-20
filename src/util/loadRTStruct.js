import dcmjs from "dcmjs";
const dicomlab2RGB = dcmjs.data.Colors.dicomlab2RGB;

export default async function loadRTStruct(instance) {
  await checkAndLoadContourData(instance);

  const {
    StructureSetROISequence,
    ROIContourSequence,
    RTROIObservationsSequence,
  } = instance;

  // Define our structure set entry and add it to the rtstruct module state.
  const structureSet = {
    StructureSetLabel: instance.StructureSetLabel,
    SeriesInstanceUID: instance.SeriesInstanceUID,
    ROIContours: [],
    visible: true,
  };

  for (let i = 0; i < ROIContourSequence.length; i++) {
    const ROIContour = ROIContourSequence[i];
    const { ContourSequence } = ROIContour;

    if (!ContourSequence) {
      continue;
    }

    const isSupported = false;
    const ContourSequenceArray = _toArray(ContourSequence);

    const contourPoints = [];
    for (let c = 0; c < ContourSequenceArray.length; c++) {
      const {
        ContourData,
        NumberOfContourPoints,
        ContourGeometricType,
      } = ContourSequenceArray[c];

      let isSupported = false;

      const points = [];
      for (let p = 0; p < NumberOfContourPoints * 3; p += 3) {
        points.push({
          x: ContourData[p],
          y: ContourData[p + 1],
          z: ContourData[p + 2],
        });
      }

      switch (ContourGeometricType) {
        case "CLOSED_PLANAR":
        case "OPEN_PLANAR":
        case "POINT":
          isSupported = true;

          break;
        default:
          continue;
      }

      contourPoints.push({
        numberOfPoints: NumberOfContourPoints,
        points,
        type: ContourGeometricType,
        isSupported,
      });
    }

    _setROIContourMetadata(
      structureSet,
      StructureSetROISequence,
      RTROIObservationsSequence,
      ROIContour,
      contourPoints,
      isSupported
    );
  }
  return structureSet;
}

async function checkAndLoadContourData(instance) {
  if (!instance || !instance.ROIContourSequence) {
    return Promise.reject("Invalid instance object or ROIContourSequence");
  }

  const promisesMap = new Map();

  for (const ROIContour of instance.ROIContourSequence) {
    const referencedROINumber = ROIContour.ReferencedROINumber;
    if (!ROIContour || !ROIContour.ContourSequence) {
      promisesMap.set(referencedROINumber, [Promise.resolve([])]);
      continue;
    }

    for (const Contour of ROIContour.ContourSequence) {
      if (!Contour || !Contour.ContourData) {
        return Promise.reject("Invalid Contour or ContourData");
      }

      const contourData = Contour.ContourData;

      if (Array.isArray(contourData)) {
        promisesMap.has(referencedROINumber)
          ? promisesMap
              .get(referencedROINumber)
              .push(Promise.resolve(contourData))
          : promisesMap.set(referencedROINumber, [
              Promise.resolve(contourData),
            ]);
      }
    }
  }

  const resolvedPromisesMap = new Map();
  for (const [key, promiseArray] of promisesMap.entries()) {
    resolvedPromisesMap.set(key, await Promise.allSettled(promiseArray));
  }

  instance.ROIContourSequence.forEach((ROIContour) => {
    try {
      const referencedROINumber = ROIContour.ReferencedROINumber;
      const resolvedPromises = resolvedPromisesMap.get(referencedROINumber);

      if (ROIContour.ContourSequence) {
        ROIContour.ContourSequence.forEach((Contour, index) => {
          const promise = resolvedPromises[index];
          if (promise.status === "fulfilled") {
            if (
              Array.isArray(promise.value) &&
              promise.value.every(Number.isFinite)
            ) {
              // If promise.value is already an array of numbers, use it directly
              Contour.ContourData = promise.value;
            } else {
              // If the resolved promise value is a byte array (Blob), it needs to be decoded
              const uint8Array = new Uint8Array(promise.value);
              const textDecoder = new TextDecoder();
              const dataUint8Array = textDecoder.decode(uint8Array);
              if (
                typeof dataUint8Array === "string" &&
                dataUint8Array.includes("\\")
              ) {
                Contour.ContourData = dataUint8Array
                  .split("\\")
                  .map(parseFloat);
              } else {
                Contour.ContourData = [];
              }
            }
          } else {
            console.error(promise.reason);
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  });
}

function _setROIContourMetadata(
  structureSet,
  StructureSetROISequence,
  RTROIObservationsSequence,
  ROIContour,
  contourPoints,
  isSupported
) {
  const StructureSetROI = StructureSetROISequence.find(
    (structureSetROI) =>
      structureSetROI.ROINumber === ROIContour.ReferencedROINumber
  );

  const ROIContourData = {
    ROINumber: StructureSetROI.ROINumber,
    ROIName: StructureSetROI.ROIName,
    ROIGenerationAlgorithm: StructureSetROI.ROIGenerationAlgorithm,
    ROIDescription: StructureSetROI.ROIDescription,
    isSupported,
    contourPoints,
    visible: true,
  };

  _setROIContourDataColor(ROIContour, ROIContourData);

  if (RTROIObservationsSequence) {
    // If present, add additional RTROIObservations metadata.
    _setROIContourRTROIObservations(
      ROIContourData,
      RTROIObservationsSequence,
      ROIContour.ReferencedROINumber
    );
  }

  structureSet.ROIContours.push(ROIContourData);
}

function _setROIContourDataColor(ROIContour, ROIContourData) {
  let { ROIDisplayColor, RecommendedDisplayCIELabValue } = ROIContour;

  if (!ROIDisplayColor && RecommendedDisplayCIELabValue) {
    // If ROIDisplayColor is absent, try using the RecommendedDisplayCIELabValue color.
    ROIDisplayColor = dicomlab2RGB(RecommendedDisplayCIELabValue);
  }

  if (ROIDisplayColor) {
    ROIContourData.colorArray = [...ROIDisplayColor];
  }
}

function _setROIContourRTROIObservations(
  ROIContourData,
  RTROIObservationsSequence,
  ROINumber
) {
  const RTROIObservations = RTROIObservationsSequence.find(
    (RTROIObservations) => RTROIObservations.ReferencedROINumber === ROINumber
  );

  if (RTROIObservations) {
    // Deep copy so we don't keep the reference to the dcmjs dataset entry.
    const {
      ObservationNumber,
      ROIObservationDescription,
      RTROIInterpretedType,
      ROIInterpreter,
    } = RTROIObservations;

    ROIContourData.RTROIObservations = {
      ObservationNumber,
      ROIObservationDescription,
      RTROIInterpretedType,
      ROIInterpreter,
    };
  }
}

function _toArray(objOrArray) {
  return Array.isArray(objOrArray) ? objOrArray : [objOrArray];
}
