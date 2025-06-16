import * as dicomparser  from 'dicom-parser';

export default async function DicomParserfromArraybuffer(arrayBuffer){
    //const dicomParser = new dicomparser.DicomParser();
    var byteArray = new Uint8Array(arrayBuffer);

    try
    {
        // Allow raw files
        const options = { TransferSyntaxUID: '1.2.840.10008.1.2' };
        // Parse the byte array to get a DataSet object that has the parsed contents
        var dataSet = dicomparser.parseDicom(byteArray, options);
    
        // access a string element
        var study_instanceuid = dataSet.string('x0020000d');
        var puhid = dataSet.string('x00100020');
        var patientName = dataSet.string('x00100010');
        var modality = dataSet.string('x000800610');
        var institutionName = dataSet.string('x00080080');
        var description = dataSet.string('x00081030');
        var referring_physician_name = dataSet.string('x00080090');
        var number_of_study_related_series = dataSet.string('x00201206');
        var number_of_study_related_instances = dataSet.string('x00201208');
        var study_date = dataSet.string('x00080020');
        var study_time = dataSet.string('x00080030');
        var accession_number = dataSet.string('x00080050');
        var instance_availability = dataSet.string('x00080056');
        var modalities_in_study = dataSet.string('x00080060');
        var studyid = dataSet.string('x00200010');
        var patient_sex = dataSet.string('x00100040');
        var patient_birthdate = dataSet.string('x00100030');
        //var studyDate = 

         // Create an object with the extracted metadata
        const dicomParserData = {
            study_instanceuid,
            puhid,
            patientName,
            modality,
            institutionName,
            description,
            referring_physician_name,
            number_of_study_related_series,
            number_of_study_related_instances,
            study_date,
            study_time,
            accession_number,
            instance_availability,
            modalities_in_study,
            studyid,
        };
        return dicomParserData;
    }
    catch(ex)
    {
       console.log('Error parsing byte stream', ex);
       return '';
    }
}