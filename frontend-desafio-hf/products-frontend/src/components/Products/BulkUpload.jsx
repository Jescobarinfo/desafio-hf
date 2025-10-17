import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Upload, Button, Space, Alert, Progress } from 'antd';
import { UploadOutlined, FileTextOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { bulkCreateProducts, fetchProducts } from '../../redux/slices/productSlice';
import { showError } from '../../utils/notifications';

const BulkUpload = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.products);
  const [fileContent, setFileContent] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileList, setFileList] = useState([]);

  const handleBeforeUpload = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
       
        
        if (Array.isArray(json) && json.length > 0) {
          setFileContent(json);
          setFileName(file.name);
          setFileList([file]);
        } else {
          showError('El archivo debe contener un array de productos con al menos 1 elemento');
          setFileList([]);
        }
      } catch (error) {
        console.error('Error al parsear JSON:', error);
        showError('Error al leer el archivo JSON. Verifica que sea un JSON válido.');
        setFileList([]);
      }
    };
    
    reader.onerror = () => {
      showError('Error al leer el archivo');
      setFileList([]);
    };
    
    reader.readAsText(file);
    return false; // Prevenir upload automático
  };

  const handleRemove = () => {
    setFileContent(null);
    setFileName('');
    setFileList([]);
  };

  const handleUpload = async () => {
    if (!fileContent || fileContent.length === 0) {
      showError('Por favor selecciona un archivo JSON válido con productos');
      return;
    }

    const result = await dispatch(bulkCreateProducts(fileContent));
    
    if (result.type === 'products/bulkCreate/fulfilled') {
      await dispatch(fetchProducts());
      handleRemove();
      onClose();
    }
  };

  const handleCancel = () => {
    handleRemove();
    onClose();
  };

   console.log(import.meta.env.VITE_API_URL)

  return (
    <Modal
      title="Carga Masiva de Productos"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          message="Formato JSON Requerido"
          description="El archivo debe ser un JSON con un array de productos. Cada producto debe tener: id, title, price, description, category, image, y rating (opcional)."
          type="info"
          showIcon
        />

        <Upload
          accept=".json"
          beforeUpload={handleBeforeUpload}
          onRemove={handleRemove}
          fileList={fileList}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />} size="large" block>
            Seleccionar archivo JSON
          </Button>
        </Upload>

        {fileName && fileContent && (
          <Alert
            message={
              <Space>
                <FileTextOutlined />
                <span>Archivo: <strong>{fileName}</strong></span>
              </Space>
            }
            description={`✅ ${fileContent.length} producto${fileContent.length !== 1 ? 's' : ''} listo${fileContent.length !== 1 ? 's' : ''} para cargar`}
            type="success"
            showIcon
            closable={false}
          />
        )}

        {loading && (
          <div>
            <Progress percent={100} status="active" />
            <p style={{ textAlign: 'center', marginTop: 8 }}>
              Cargando productos...
            </p>
          </div>
        )}

        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="primary"
            onClick={handleUpload}
            disabled={!fileContent || fileContent.length === 0 || loading}
            loading={loading}
            size="large"
          >
            {fileContent && fileContent.length > 0 
              ? `Cargar ${fileContent.length} Producto${fileContent.length !== 1 ? 's' : ''}`
              : 'Cargar Productos'
            }
          </Button>
        </Space>
      </Space>
    </Modal>
  );
};

export default BulkUpload;