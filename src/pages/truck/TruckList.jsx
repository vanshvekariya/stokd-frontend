import { useState } from 'react';
import Table from '../../components/Table';
import PageHeader from '../../components/Heading';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import warningIcon from '../../assets/warning.svg';
import { truckColumn } from './TruckColumn';
import { useFormik } from 'formik';
import { truckSchema } from '../../common/validation';

const data = [
  {
    id: 1,
    driver: 'Alex Johnson',
    registration: 'BX 65 PE',
    capacity: '14 Ton',
    status: 'On Route',
    orders: '4',
    lastKnownLocation: 'Main St & 5th Ave',
    lastUpdated: '10 mins ago',
  },
  {
    id: 2,
    driver: 'Alex Johnson',
    registration: 'BX 65 PE',
    capacity: '14 Ton',
    status: 'On Route',
    orders: '4',
    lastKnownLocation: 'Main St & 5th Ave',
    lastUpdated: '10 mins ago',
  },
];
const TruckList = () => {
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
      registration: '',
      capacity: '',
    },
    validationSchema: truckSchema,
    onSubmit: handleSubmit,
  });

  return (
    <>
      <PageHeader
        title="Trucks"
        buttonText="New Truck"
        onButtonClick={() =>
          setShowModal({ show: true, isEdit: false, details: '' })
        }
      />
      <Table columns={truckColumn(handlEdit, handlDelete)} getData={getData} />
      {showModal.show && (
        <Modal
          title={showModal.isEdit ? 'Edit Truck' : 'New Truck'}
          rightButtonTitle={showModal.isEdit ? 'Save Changes' : 'Add Truck'}
          leftButtonTitle="Close"
          rightButtonFunctionCall={formik.handleSubmit}
          isTitleLeft
          contentScroll
          leftButtonFunctionCall={() =>
            setShowModal({ show: false, isEdit: false, details: '' })
          }
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
                label="Registration"
                type="text"
                name="registration"
                value={formik.values.registration}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="BX 65 PE"
                error={
                  formik.touched.registration && formik.errors.registration
                }
              />
              <Select
                label="Truck Capacity"
                name="capacity"
                placeholder="Select Capacity"
                options={['14 Ton', '16 Ton']}
                value={formik.values.capacity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.capacity && formik.errors.capacity}
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
              Are you sure you want to delete this truck?
            </div>
          )}
        />
      )}
    </>
  );
};

export default TruckList;
