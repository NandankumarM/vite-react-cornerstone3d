import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Tooltip,
  Stack,
  //  TablePagination,
  //  TableFooter
} from '@mui/material';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { PrivilegeCheck, isNotEmpty } from './CommonHelper.util';
import LocalStorageService from '../services/LocalStorageService';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";




// const rows = [
//   createData('1','Ramesh Kumar', 'KABHK_0000232228', 'Radiology', '11/09/2023 - 12/09/2033', 'CT NECK SOFT TISSUE  W/ CONTR'),
//   createData('2','Anil Kumar Pillai', 'KABHK_0000232228', 'MRI', '15/09/2023', 'DFCI CT CHEST W CONTRAST 6023'),
//   createData('3','Sneha', 'KABHK_0000232228', 'Electrotherapy,MRI','11/09/2023 - 12/09/2033', 'lorem ipsum'),
//   createData('4','Cupcake', 'KABHK_0000232228', 'Electrotherapy', '11/09/2023 - 12/09/2033', 'lorem ipsum'),
//   createData('5','Gingerbread','KABHK_0000232228', 'Electrotherapy','11/09/2023 - 12/09/2033', 'lorem ipsum'),
//   createData('6','Abhishek','KABHK_1100232289', 'X-Ray','09/10/2023 - 10/10/2023', 'Wrist'),
//   createData('7','Bhanumathi','KABHK_2200232298', 'CT-Scan','10/10/2023 - 12/10/2023', 'head'),
//   createData('8','Chethan','KABHK_3200232256', 'ECG','12/10/2023 - 12/10/2023', 'heart rate monitoring'),
//   createData('9','Darshan','KABHK_2900232219', 'MRI','12/10/2023 - 13/10/2023', 'inner eyes'),
//   createData('10','Gagana','KABHK_4500232238', 'PET','13/10/2023 - 14/10/2023', 'cancer treatement'),
//   createData('11','Farida','KABHK_7800232276', 'SPECT','14/10/2023 - 15/10/2023', 'blood flow'),
//   createData('12','Jasmin','KABHK_5400232234', 'LDCT','15/10/2023 - 16/10/2023', 'lungs'),
//   createData('13','Kavana','KABHK_3100232298', 'Computed axial tomography','19/10/2023 - 25/10/2023', 'brain disorder'),
//   createData('14','Lavanya','KABHK_8600232268', 'Endoscopy','26/10/2023 - 30/10/2023', 'stomach'),
//   createData('15','Mohan','KABHK_8900232223', 'Ultrasound','01/11/2023 - 3/11/2023', 'kidney'),
//   createData('16','Nayana','KABHK_9900232234', 'Endoscopy','03/11/2023 - 05/11/2023', 'Intestine'),
//   createData('17','Pramod','KABHK_3400232270', 'Optical scanner','06/11/2023 - 07/11/2023', 'mouth'),
//   createData('18','Ramya','KABHK_8200232267', 'ENT','08/11/2023 - 08/11/2023', 'ears'),
//   createData('19','Snehith','KABHK_2100232289', 'Cone beam CT-Scan','09/11/2023 - 10/11/2023', 'teeth'),
//   createData('20','Vinay','KABHK_1200232234', 'Corneal topography','11/11/2023 - 12/11/2023', 'Eyes'),
//   createData('21','Narmatha','KABHK_4300232263', 'Ventilation Scan','13/11/2023 - 17/11/2023', 'chest'),
// ];


export default function StickyHeadTable(props) {

  const { rows } = props;
  const licStatus = LocalStorageService.getLicenseStatus();

  let columns = [
    {
      title: 'S.No',
      dataIndex: 'sno',
      key: 'sno',
      width: 20

    },
    {
      title: 'Hospital Name',
      dataIndex: 'hospitalName',
      key: 'hospitalName',

    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',

    },
    {
      title: 'City',
      dataIndex: 'cityId',
      key: 'cityId',
      render: (text, record) => (
        <span>
          {/* {cityCheck(record.hospitalId)} */}
        </span>
      )

    },
    {
      title: 'Status',
      key: 'status',
      render: (text, record) => (
        <span>
          {record.status}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <span>
          <Divider type="vertical" />
          {((PrivilegeCheck("Hospital Registration", 2) && licStatus)) ?
            <Link to={`/hospital/edit/${record.hospitalId}`}>
              <Tooltip placement="top" title="Edit">
                <span className="gx-link icon icon-edit gx-mr">  </span>
              </Tooltip>
            </Link> : ""}
          <Divider type="vertical" />
          {((PrivilegeCheck("Hospital Registration", 3))) ?
            <Link to={`/hospital/view/${record.hospitalId}`}>
              <Tooltip placement="top" title="View">
                <span className="gx-link icon icon-view-o">  </span>
              </Tooltip>
            </Link> : ""}
        </span>
      ),
    }
  ];


  const rowsPerPageOptions = [5, 10, 25]; // Define the options for rows per page

  const [page, setPage] = React.useState(0); // Current page number
  const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageOptions[1]); // Rows per page

  const [totalRows, setTotalRows] = React.useState()

  React.useEffect(() => {
    if (isNotEmpty(rows)) {
      setTotalRows(rows.length)
    }
  }, [rows])

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage((prevPage) => (prevPage > 0 ? prevPage - 1 : 0));
  };

  const calculateCurrentRows = () => {
    const startRowCount = page * rowsPerPage + 1;
    let currentRowCount = startRowCount + rowsPerPage - 1;
    if (currentRowCount > totalRows) {
      currentRowCount = totalRows;
    }
    return { startRowCount, currentRowCount };
  };
  const { startRowCount, currentRowCount } = calculateCurrentRows();


  function Row(props) {
    const { row } = props;
  
    return (
      <React.Fragment >
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} className='column-class' style={{ paddingBottom: '19px' }} >
          <TableCell component="th" scope="row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
            <div>
              {row.sno}
            </div>
          </TableCell>
          <TableCell align="left" >{row.hospitalName}</TableCell>
          <TableCell align="left" >{row.code}</TableCell>
          <TableCell align="left" >{row.cityId}</TableCell>
          <TableCell align="left" >{row.status}</TableCell>
          <TableCell align="left" >
            <span>
              <Stack direction="row">
                {((PrivilegeCheck("Hospital Registration",2) && licStatus))?
                <Link to={`/hospital/edit/${row.hospitalId}`}>
                  <Tooltip placement="top" title="Edit">
                    <span className="gx-link icon icon-edit gx-mr">
                      <NoteAltOutlinedIcon />
  
                    </span>
                  </Tooltip>
                </Link>
                 :""}
                {((PrivilegeCheck("Hospital Registration",3) ))?
                <Link to={`/hospital/view/${row.hospitalId}`}>
                  <Tooltip placement="top" title="View">
                    <span className="gx-link icon icon-edit gx-mr">
                      <RemoveRedEyeOutlinedIcon />
                    </span>
                  </Tooltip>
                </Link>
                 :""}                                     
              </Stack>
            </span>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }
  
  Row.propTypes = {
    row: PropTypes.shape({
      calories: PropTypes.number.isRequired,
      carbs: PropTypes.number.isRequired,
      fat: PropTypes.number.isRequired,
      history: PropTypes.arrayOf(
        PropTypes.shape({
          amount: PropTypes.number.isRequired,
          customerId: PropTypes.string.isRequired,
          date: PropTypes.string.isRequired,
        }),
      ).isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      protein: PropTypes.number.isRequired,
    }).isRequired,
  };
  

  return (
    <>
      <TableContainer component={Paper} style={{ marginRight: 20, marginBottom: 20 }}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  className='Header-class'
                >
                  {column.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody className='PatientGridTableCell'>
            {rows && rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <Row key={row.hospitalName} row={row} licStatus={licStatus} />
            ))}
          </TableBody>
        </Table>

        <div className="GridFooterPagination">
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btnPrev"
              style={{ marginRight: "10px" }}
              onClick={handlePrevPage}
              disabled={page === 0}
            >
              <FaChevronLeft
                style={{
                  pointerEvents: page === 0 ? "none" : "auto",
                  opacity: page === 0 ? 0.5 : 1,
                }}
              />
            </button>
            <button
              className="btnPrev"
              onClick={handleNextPage}
              disabled={page >= Math.ceil(totalRows / rowsPerPage) - 1}
            >
              <FaChevronRight
                style={{
                  pointerEvents:
                    page >= Math.ceil(totalRows / rowsPerPage) - 1
                      ? "none"
                      : "auto",
                  opacity:
                    page >= Math.ceil(totalRows / rowsPerPage) - 1 ? 0.5 : 1,
                }}
              />
            </button>
          </div>
        </div>

      </TableContainer>
    </>
  );
}