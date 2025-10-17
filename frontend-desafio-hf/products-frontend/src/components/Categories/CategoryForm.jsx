import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Input, Button, Space } from 'antd';
import { createCategory } from '../../redux/slices/categorySlice';

const CategoryForm = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.categories);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    const result = await dispatch(createCategory(data));
    if (result.type === 'categories/create/fulfilled') {
      reset();
      onClose();
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      title="Registrar Nueva Categoría"
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label="Nombre de la Categoría"
          validateStatus={errors.category_name ? 'error' : ''}
          help={errors.category_name?.message}
        >
          <Controller
            name="category_name"
            control={control}
            rules={{
              required: 'El nombre es requerido',
              minLength: {
                value: 3,
                message: 'Mínimo 3 caracteres',
              },
              maxLength: {
                value: 100,
                message: 'Máximo 100 caracteres',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Ej: Electrónica"
                size="large"
              />
            )}
          />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Crear Categoría
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryForm;