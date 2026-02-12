import { useState } from 'react';
import Table from '../../components/Table';
import PageHeader from '../../components/Heading';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import warningIcon from '../../assets/warning.svg';
import { driverColumn } from './DriverColumn';
import { useFormik } from 'formik';
import { driverSchema } from '../../common/validation';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../routes/paths';

const data = [
  {
    id: 1,
    driver: 'Alex Johnson',
    status: 'On Route',
    truck: '4',
    deliveryZone: 'Main St & 5th Ave',
  },
  {
    id: 2,
    driver: 'Alex Johnson',
    status: 'On Route',
    truck: '4',
    deliveryZone: 'Main St & 5th Ave',
  },
];
const DriverList = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState({
    show: false,
    isEdit: false,
    details: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState({
    show: false,
    details: '',
  });

  const getData = async () => {
    // Your API call here
    return {
      data: data,
      rowCount: 10,
    };
  };

  const handlEdit = (row) => {
    setShowModal({ show: true, isEdit: true, details: row });
  };
  const handlDelete = (row) => {
    setShowDeleteModal({ show: true, details: row });
  };

  const handleSubmit = (values, { setSubmitting }) => {
    // console.log('Form values:', values);
    // Add your login logic here
    setSubmitting(false);
  };

  const formik = useFormik({
    initialValues: {
      driverName: '',
      deliveryEmail: '',
      zone: '',
    },
    validationSchema: driverSchema,
    onSubmit: handleSubmit,
  });

  return (
    <>
      <PageHeader
        title="Driver Management"
        buttonText="Invite New Driver"
        onButtonClick={() =>
          setShowModal({ show: true, isEdit: false, details: '' })
        }
        secondaryButton={
          <Button
            variant="secondary"
            className="mr-3"
            size="sm"
            onClick={() => navigate(paths.deliveryZones)}
          >
            Add Delivery Zones
          </Button>
        }
      />
      <Table columns={driverColumn(handlEdit, handlDelete)} getData={getData} />
      {showModal.show && (
        <Modal
          title={showModal.isEdit ? 'Edit Driver' : 'Invite A New Driver'}
          rightButtonTitle={showModal.isEdit ? 'Save Changes' : 'Add Driver'}
          leftButtonTitle="Close"
          isTitleLeft
          contentScroll
          leftButtonFunctionCall={() =>
            setShowModal({ show: false, isEdit: false, details: '' })
          }
          rightButtonFunctionCall={formik.handleSubmit}
          modalBodyFunction={() => (
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-3"
            >
              <Input
                label="Driver Name"
                type="text"
                name="driverName"
                value={formik.values.driverName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Alex Johnson"
                error={formik.touched.driverName && formik.errors.driverName}
              />
              <Input
                label="Delivery Email"
                type="email"
                name="deliveryEmail"
                value={formik.values.deliveryEmail}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="BX 65 PE"
                error={
                  formik.touched.deliveryEmail && formik.errors.deliveryEmail
                }
              />
              <Select
                label="Select Zones"
                name="zone"
                placeholder="Select Zone"
                options={['Sydney', 'Tasmania']}
                value={formik.values.zone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.zone && formik.errors.zone}
              />
            </form>
          )}
        />
      )}
      {showDeleteModal.show && (
        <Modal
          src={warningIcon}
          imageStyle="w-18 h-18"
          leftButtonTitle="Close"
          rightButtonTitle="Yes, Delete"
          showSmallModal
          leftButtonFunctionCall={() =>
            setShowDeleteModal({ show: false, details: '' })
          }
          modalBodyFunction={() => (
            <div className="px-4 font-bold text-text-primary text-center text-xl">
              Are you sure you want to delete this driver?
            </div>
          )}
        />
      )}
    </>
  );
};

export default DriverList;
