import { calculateSUVScalingFactors } from "@cornerstonejs/calculate-suv";
import { utilities } from "@cornerstonejs/core";
import cornerstoneDICOMImageLoader from "@cornerstonejs/dicom-image-loader";
import dcmjs from "dcmjs";
import { api } from "dicomweb-client";
import { getPTImageIdInstanceMetadata } from "./getPTImageIdInstanceMetadata";

import { convertMultiframeImageIds } from "./convertMultiframeImageIds";
import getPixelSpacingInformation from "./getPixelSpacingInformation";
import ptScalingMetaDataProvider from "./ptScalingMetaDataProvider";
import removeInvalidTags from "./removeInvalidTags";

const { DicomMetaDictionary } = dcmjs.data;
const { calibratedPixelSpacingMetadataProvider } = utilities;

/**
/**
 * Uses dicomweb-client to fetch metadata of a study, cache it in cornerstone,
 * and return a list of imageIds for the frames.
 *
 * Uses the app config to choose which study to fetch, and which
 * dicom-web server to fetch it from.
 *
 * @returns {imageIds: string[],patientPosition:string} An array of imageIds for instances in the study.
 */

export default async function createImageIdsAndCacheMetaData({
  StudyInstanceUID,
  SeriesInstanceUID,
  SOPInstanceUID = null,
  wadoRsRoot,
  client = null,
  thumbNailFlag = false,
}) {
  const SOP_INSTANCE_UID = "00080018";
  const SERIES_INSTANCE_UID = "0020000E";
  const MODALITY = "00080060";
  const PATIENT_POSITION = "00185100";

  const studySearchOptions = {
    studyInstanceUID: StudyInstanceUID,
    seriesInstanceUID: SeriesInstanceUID,
  };

  client = client || new api.DICOMwebClient({ url: wadoRsRoot });
  let instances = await client.retrieveSeriesMetadata(studySearchOptions);

  const modality = instances[0][MODALITY].Value[0];

  const patientPosition = instances[0][PATIENT_POSITION]?.Value[0];


  if (thumbNailFlag) {
    instances = [instances[0]];
  }

  let imageIds = instances.map((instanceMetaData) => {
    const SeriesInstanceUID = instanceMetaData[SERIES_INSTANCE_UID].Value[0];
    const SOPInstanceUIDToUse =
      SOPInstanceUID || instanceMetaData[SOP_INSTANCE_UID].Value[0];

    const prefix = "wadors:";

    const imageId =
      prefix +
      wadoRsRoot +
      "/studies/" +
      StudyInstanceUID +
      "/series/" +
      SeriesInstanceUID +
      "/instances/" +
      SOPInstanceUIDToUse +
      "/frames/1";

    cornerstoneDICOMImageLoader.wadors.metaDataManager.add(
      imageId,
      instanceMetaData
    );
    return imageId;
  });

  // if the image ids represent multiframe information, creates a new list with one image id per frame
  // if not multiframe data available, just returns the same list given
  imageIds = convertMultiframeImageIds(imageIds);

  imageIds.forEach((imageId) => {
    let instanceMetaData =
      cornerstoneDICOMImageLoader.wadors.metaDataManager.get(imageId);

    // It was using JSON.parse(JSON.stringify(...)) before but it is 8x slower
    instanceMetaData = removeInvalidTags(instanceMetaData);

    if (instanceMetaData) {
      // Add calibrated pixel spacing
      const metadata = DicomMetaDictionary.naturalizeDataset(instanceMetaData);
      const pixelSpacing = getPixelSpacingInformation(metadata);

      if (pixelSpacing) {
        calibratedPixelSpacingMetadataProvider.add(imageId, {
          rowPixelSpacing: parseFloat(pixelSpacing[0]),
          columnPixelSpacing: parseFloat(pixelSpacing[1]),
        });
      }
    }
  });

  // we don't want to add non-pet
  // Note: for 99% of scanners SUV calculation is consistent bw slices
  if (modality === "PT") {
    const InstanceMetadataArray = [];
    imageIds.forEach((imageId) => {
      const instanceMetadata = getPTImageIdInstanceMetadata(imageId);

      // TODO: Temporary fix because static-wado is producing a string, not an array of values
      // (or maybe dcmjs isn't parsing it correctly?)
      // It's showing up like 'DECY\\ATTN\\SCAT\\DTIM\\RAN\\RADL\\DCAL\\SLSENS\\NORM'
      // but calculate-suv expects ['DECY', 'ATTN', ...]
      if (typeof instanceMetadata.CorrectedImage === "string") {
        instanceMetadata.CorrectedImage =
          instanceMetadata.CorrectedImage.split("\\");
      }

      if (instanceMetadata) {
        InstanceMetadataArray.push(instanceMetadata);
      }
    });
    if (InstanceMetadataArray.length) {
      try {
        const suvScalingFactors = calculateSUVScalingFactors(
          InstanceMetadataArray
        );
        InstanceMetadataArray.forEach((instanceMetadata, index) => {
          ptScalingMetaDataProvider.addInstance(
            imageIds[index],
            suvScalingFactors[index]
          );
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  return {imageIds, patientPosition};
}

async function getPatientPosition(StudyInstanceUID,
  SeriesInstanceUID,
  SOPInstanceUID = null,
  wadoRsRoot,
  client = null,
  thumbNailFlag = false,) {
    const SOP_INSTANCE_UID = "00080018";
    const SERIES_INSTANCE_UID = "0020000E";
    const MODALITY = "00080060";
    const PATIENT_POSITION = "00185100";
  
    const studySearchOptions = {
      studyInstanceUID: StudyInstanceUID,
      seriesInstanceUID: SeriesInstanceUID,
    };
  
    client = client || new api.DICOMwebClient({ url: wadoRsRoot });
    let instances = await client.retrieveSeriesMetadata(studySearchOptions);
  
    const modality = instances[0][MODALITY].Value[0];
  
    const patientPosition = instances[0][PATIENT_POSITION].Value[0];
  
  return { patientPosition };
}
