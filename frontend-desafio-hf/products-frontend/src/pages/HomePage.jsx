import { useState } from 'react';
import { Layout, Button, Space, Typography, Divider } from 'antd';
import { PlusOutlined, AppstoreOutlined, TagsOutlined, CloudUploadOutlined } from '@ant-design/icons';
import CategoryForm from '../components/Categories/CategoryForm';
import CategoryList from '../components/Categories/CategoryList';
import ProductForm from '../components/Products/ProductForm';
import ProductList from '../components/Products/ProductList';
import BulkUpload from '../components/Products/BulkUpload';
import logo from '../assets/logo/hf-Photo.png';

const { Header, Content } = Layout;
const { Title } = Typography;

const HomePage = () => {
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [bulkUploadOpen, setBulkUploadOpen] = useState(false);



    return (
        <Layout style={{ minHeight: '100vh', width: '100%' }}>
            <Header style={{
                background: '#001529',
                padding: '12px 16px',
                width: '100%',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', minWidth: '200px' }}>
                        <img
                            src={logo}
                            alt="Logo"
                            style={{ width: 32, height: 32, borderRadius: 6, marginRight: 8 }}
                        />
                        <Title
                            level={4}
                            style={{
                                color: 'white',
                                margin: 0,
                                lineHeight: '32px',
                                fontSize: 'clamp(14px, 3vw, 18px)'
                            }}
                        >
                           Desafio HF - Sistema de Productos
                        </Title>
                    </div>

                    <Space wrap style={{ justifyContent: 'flex-end' }}>
                        <Button
                            type="default"
                            icon={<CloudUploadOutlined />}
                            onClick={() => setBulkUploadOpen(true)}
                            size="large"
                            style={{ background: '#722ed1', borderColor: '#722ed1', color: 'white' }}
                        >
                            <span className="btn-text">Carga Masiva</span>
                        </Button>

                        <Button
                            type="primary"
                            icon={<TagsOutlined />}
                            onClick={() => setCategoryModalOpen(true)}
                            size="large"
                        >
                            <span className="btn-text">Nueva Categoría</span>
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setProductModalOpen(true)}
                            size="large"
                            style={{ background: '#52c41a', borderColor: '#52c41a' }}
                        >
                            <span className="btn-text">Nuevo Producto</span>
                        </Button>
                    </Space>
                </div>
            </Header>

            <Content style={{
                padding: '24px',
                background: '#f0f2f5',
                width: '100%',
                marginTop: '0'
            }}>
                <CategoryList />
                <Divider />
                <ProductList />
            </Content>

            <CategoryForm
                open={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
            />

            <ProductForm
                open={productModalOpen}
                onClose={() => setProductModalOpen(false)}
            />


            <BulkUpload
                open={bulkUploadOpen}
                onClose={() => setBulkUploadOpen(false)}
            />
        </Layout>
    );
};

export default HomePage;