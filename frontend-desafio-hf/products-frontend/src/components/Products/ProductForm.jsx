import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';  Controller
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Input, InputNumber, Select, Button, Space, Rate } from 'antd';
import { createProduct, updateProduct } from '../../redux/slices/productSlice';
import { fetchCategories } from '../../redux/slices/categorySlice';

const { TextArea } = Input;

const ProductForm = ({ open, onClose, productToEdit = null }) => {
  const dispatch = useDispatch();
  const { loading, items: products } = useSelector((state) => state.products);
  const { items: categories } = useSelector((state) => state.categories);

  // Calcular el siguiente ID disponible
  const nextProductId = useMemo(() => {
    if (products.length === 0) return 1;
    const maxId = Math.max(...products.map(p => p.product_id));
    return maxId + 1;
  }, [products]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (productToEdit) {
      reset({
        product_id: productToEdit.product_id,
        title: productToEdit.title,
        price: productToEdit.price,
        description: productToEdit.description,
        category_id: productToEdit.category_id,
        image_url: productToEdit.image_url,
        rating_score: productToEdit.rating_score || '',
        review_count: productToEdit.review_count || '',
      });
    } else {
      reset({
        product_id: nextProductId,
        title: '',
        price: '',
        description: '',
        category_id: null,
        image_url: '',
        rating_score: '',
        review_count: '',
      });
    }
  }, [productToEdit, reset, nextProductId]);

  const onSubmit = async (data) => {
    if (productToEdit) {
      const result = await dispatch(updateProduct({
        id: productToEdit.product_id,
        data: {
          title: data.title,
          price: data.price,
          description: data.description,
          category_id: data.category_id,
          image_url: data.image_url,
          rating_score: data.rating_score || null,
          review_count: data.review_count || null,
        },
      }));
      if (result.type === 'products/update/fulfilled') {
        reset();
        onClose();
      }
    } else {
      const result = await dispatch(createProduct(data));
      if (result.type === 'products/create/fulfilled') {
        reset();
        onClose();
      }
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      title={productToEdit ? 'Actualizar Producto' : 'Registrar Nuevo Producto'}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width="90%"
      style={{ maxWidth: 600 }}
      destroyOnClose
    >
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {!productToEdit && (
          <Form.Item
            label="ID del Producto"
            validateStatus={errors.product_id ? 'error' : ''}
            help={errors.product_id?.message || 'ID generado automáticamente'}
          >
            <Controller
              name="product_id"
              control={control}
              rules={{ required: 'El ID es requerido' }}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  style={{ width: '100%' }}
                  placeholder="Ej: 1"
                  size="large"
                  disabled
                />
              )}
            />
          </Form.Item>
        )}

        <Form.Item
          label="Título"
          validateStatus={errors.title ? 'error' : ''}
          help={errors.title?.message}
        >
          <Controller
            name="title"
            control={control}
            rules={{
              required: 'El título es requerido',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Ej: Laptop HP Pavilion"
                size="large"
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Precio"
          validateStatus={errors.price ? 'error' : ''}
          help={errors.price?.message}
        >
          <Controller
            name="price"
            control={control}
            rules={{
              required: 'El precio es requerido',
              min: { value: 0.01, message: 'El precio debe ser mayor a 0' },
            }}
            render={({ field }) => (
              <InputNumber
                {...field}
                style={{ width: '100%' }}
                placeholder="999.99"
                size="large"
                prefix="$"
                precision={2}
                min={0}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Categoría"
          validateStatus={errors.category_id ? 'error' : ''}
          help={errors.category_id?.message}
        >
          <Controller
            name="category_id"
            control={control}
            rules={{ required: 'La categoría es requerida' }}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Selecciona una categoría"
                size="large"
                options={(categories || []).map(cat => ({
                  label: cat.category_name,
                  value: cat.category_id
                }))}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Descripción"
          validateStatus={errors.description ? 'error' : ''}
          help={errors.description?.message}
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                placeholder="Descripción del producto..."
                rows={4}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="URL de la Imagen"
          validateStatus={errors.image_url ? 'error' : ''}
          help={errors.image_url?.message}
        >
          <Controller
            name="image_url"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="https://example.com/image.jpg"
                size="large"
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Puntuación (Rating)"
          validateStatus={errors.rating_score ? 'error' : ''}
          help={errors.rating_score?.message || 'Opcional - Selecciona las estrellas'}
        >
          <Controller
            name="rating_score"
            control={control}
            render={({ field }) => (
              <Rate
                {...field}
                allowHalf
                allowClear
                style={{ fontSize: 32 }}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Número de Reviews"
          validateStatus={errors.review_count ? 'error' : ''}
          help={errors.review_count?.message || 'Opcional - Cantidad de reseñas'}
        >
          <Controller
            name="review_count"
            control={control}
            rules={{
              min: { value: 0, message: 'El número de reviews debe ser mayor o igual a 0' },
            }}
            render={({ field }) => (
              <InputNumber
                {...field}
                style={{ width: '100%' }}
                placeholder="Ej: 120"
                size="large"
                min={0}
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
              {productToEdit ? 'Actualizar' : 'Crear'} Producto
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductForm;