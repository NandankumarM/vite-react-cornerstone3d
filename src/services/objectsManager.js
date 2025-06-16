import DICOMwebClient from "dicomweb-client/src/api";
import { merge } from "lodash";
import parser from "./dicom/parser";
import Study from "./dicom/parser/study";
import Series from "./dicom/parser/series";
import Instance from "./dicom/parser/instance";
import config from "../params";

// import { getString, getName, getModalities } from "../core/DICOMWeb";
import { getString, getModalities } from "../core/DICOMWeb";
import { formatDate, formatPN, formatTime } from "../core/utils";

// url: `${config.backendUrl}/dicomweb`,
const client = new DICOMwebClient({
  url: `${config.backendUrl}`,
});

class ObjectsManager {
  #cache = new Map([
    [Study, []],
    [Series, []],
    [Instance, []],
  ]);

  #cacheObjects(objects) {
    objects.forEach((object) => {
      if (!this.#cache.has(object.constructor.name)) {
        return;
      }

      let foundIndex = null;
      const cachedObjects = this.#cache.get(object.constructor.name);
      cachedObjects.find((cachedObject, index) => {
        if (
          object[object.getObjectIdField()] ===
          cachedObject[object.getObjectIdField()]
        ) {
          cachedObjects[index] = merge(cachedObject, object);
          foundIndex = index;
        }
        return null;
      });

      if (foundIndex) {
        merge(cachedObjects[foundIndex], object);
      } else {
        cachedObjects.push(object);
      }

      this.#cache.set(object.constructor.name, cachedObjects);
    });
  }

  getObjectById(objectType, objectId) {
    const object = this.#cache
      .get(objectType)
      .find((item) => item[objectType.getObjectIdField()] === objectId);
    if (object) {
      return Promise.resolve(object);
    }
    const options = {
      queryParams: {
        [objectType.getFieldAttribute(objectType.getObjectIdField())]: objectId,
      },
    };
    const promise = this.searchObjects(objectType, options, true);
    return promise.then((objects) => {
      if (objects.length === 0) {
        return null;
      }
      return objects[0];
    });
  }

  searchStudies(options = {}) {
    // let study = [];
    // const series = [];
    return client.searchForStudies(options).then((response) => {
      const study1 = response.map((data) => parser.parse(Study, data));
      // console.log(study1);
      return study1;
    });
  }
  /**
   * @param objectType
   * @param {Object} options
   * @param cache
   * @param {Object} [options.queryParams]
   */
  searchObjects(objectType, options = {}, cache = false) {
    let searchMethod = null;
    switch (objectType) {
      case Study:
        searchMethod = (args) => client.searchForStudies(args);
        break;
      case Series:
        searchMethod = (args) => client.searchForSeries(args);
        break;
      case Instance:
        searchMethod = (args) => client.searchForInstances(args);
        break;
      default:
        throw new TypeError(`Wrong type "${objectType}"`);
    }
    const promise = searchMethod(options);
    return promise.then((response) => {
      const parsed = response.map((data) => parser.parse(objectType, data));
      if (cache) {
        this.#cacheObjects(parsed);
      }
      return parsed;
    });
  }

  async uploadObjectForBulk(arrayBuffers) {
    return await client
      .storeInstances({ datasets: [arrayBuffers] })
      .then((response) => JSON.parse(response));
  }

  uploadObjects(arrayBuffers) {
    return client
      .storeInstances({ datasets: arrayBuffers })
      .then((response) => JSON.parse(String(response)));
  }

  async retrieveDicomInstanceData(
    studyInstanceUID,
    seriesInstanceUID,
    sopInstanceUID    
  ) {
    // sopInstanceUID = "1.2.246.352.205.5247989430813246099.12495249948095200132";
    const options = {
      studyInstanceUID,
      seriesInstanceUID,
      sopInstanceUID,
    };
    
    return await client.retrieveInstance(options);
  }

  processStudyResults(rawStudies) {
    if (!rawStudies || !rawStudies.length) {
      return [];
    }

    const studies = [];
    rawStudies.forEach((studyRow) =>
      studies.push({
        studyInstanceUID: getString(studyRow.study_instanceuid),
        studyDate: formatDate(studyRow.study_date), // YYYYMMDD
        studyTime: getString(studyRow.study_time), // HHmmss.SSS (24-hour, minutes, seconds, fractional seconds)
        accessionNumber: getString(studyRow.accession_number) || "", // short string, probably a number?
        patientID: getString(studyRow.puhid) || "", // medicalRecordNumber
        patientName: formatPN(`${studyRow.pfirstname}`) || "", //${studyRow.pfirstname}
        numberOfStudyRelatedInstances:
          Number(getString(studyRow.number_of_study_related_instances)) || 0, // number
        description: getString(studyRow.description) || "",
        // modalitiesInStudy: getString(studyRow.modalitiesInStudy) || "",
        modalitiesInStudy:
          getString(getModalities(studyRow.modalities_in_study)) || "",
      })
    );
    
    return studies;
  }

  processSeriesResults(rawSeries) {
    const series = [];

    if (rawSeries && rawSeries.length) {
      // Sort rawSeries based on modality
    rawSeries.sort((a, b) => {
      const modalityA = getString(a.modality).toUpperCase(); // Ensure case-insensitive sorting
      const modalityB = getString(b.modality).toUpperCase(); 

      if (modalityA < modalityB) return -1;
      if (modalityA > modalityB) return 1;
      return 0;
    });

    // Process the sorted series
      rawSeries.forEach((seriesRow) =>
        series.push({
          studyInstanceUID: getString(seriesRow.studyInstanceUID),
          seriesInstanceUID: getString(seriesRow.seriesInstanceUID),
          modality: getString(seriesRow.modality),
          seriesNumber: getString(seriesRow.seriesNumber),
          seriesDate: formatDate(seriesRow.seriesDate),
          seriesTime: formatTime(seriesRow.seriesTime), // HHmmss.SSS (24-hour, minutes, seconds, fractional seconds)
          numSeriesInstances: Number(getString(seriesRow.numSeriesInstances)),
          seriesDescription: getString(seriesRow.seriesDescription),
          performedProcedureStepStartDate: formatDate(
            seriesRow.performedProcedureStepStartDate
          ),
          performedProcedureStepStartTime: getString(
            seriesRow.performedProcedureStepStartTime
          ), // HHmmss.SSS (24-hour, minutes, seconds, fractional seconds)
        })
      );
    }

    return series;
  }

  async fetchSeriesData(instanceID) {
    console.log(instanceID);
    const seriesoptions = {
      studyInstanceUID: instanceID,
      queryParams: {
        includefield: "00081030%2C00080060",
      },
    };

    return await client.searchForSeries(seriesoptions).then((response) => {
      const listOfSeries = response.map((data) => parser.parse(Series, data));
      return listOfSeries;
    });
    // searchObjects(Series, seriesoptions)
    //   .then((series) =>
    //   {
    //     listOfSeries = processSeriesResults(series);
    //     console.log("testpatient1", listOfSeries);
    //   }
    //   )
    //   .catch((error) => {
    //     console.error("Error :", error);
    //   });
    // console.log("testpatient", listOfSeries);
    // return listOfSeries;
  }
}

const manager = new ObjectsManager();
export default manager;
