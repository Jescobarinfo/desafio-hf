import { Modal, Descriptions, Image, Tag, Space } from 'antd';
import { StarFilled } from '@ant-design/icons';

const ProductDetail = ({ product, open, onClose }) => {
  if (!product) return null;

  return (
    <Modal
      title="Detalle del Producto"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Imagen */}
        <div style={{ textAlign: 'center' }}>
          <Image
            width={300}
            src={product.image_url || 'https://via.placeholder.com/300'}
            alt={product.title}
            style={{ borderRadius: 8 }}
          />
        </div>

        {/* Información */}
        <Descriptions bordered column={1}>
          <Descriptions.Item label="ID">
            {product.product_id}
          </Descriptions.Item>
          
          <Descriptions.Item label="Título">
            <strong style={{ fontSize: 16 }}>{product.title}</strong>
          </Descriptions.Item>
          
          <Descriptions.Item label="Precio">
            <Tag color="green" style={{ fontSize: 16, padding: '4px 12px' }}>
              {new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
              }).format(product.price)}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Categoría">
            <Tag color="blue">{product.category_name}</Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Descripción">
            {product.description || 'Sin descripción'}
          </Descriptions.Item>
          
          <Descriptions.Item label="Rating">
            {product.rating_score ? (
              <Space>
                <StarFilled style={{ color: '#faad14' }} />
                <span style={{ fontSize: 16, fontWeight: 'bold' }}>
                  {product.rating_score}
                </span>
                <span style={{ color: '#888' }}>
                  ({product.review_count} reviews)
                </span>
              </Space>
            ) : (
              <Tag>Sin calificación</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Space>
    </Modal>
  );
};

export default ProductDetail;