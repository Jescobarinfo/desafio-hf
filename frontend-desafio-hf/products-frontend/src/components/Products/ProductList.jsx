import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Table, Button, Space, Tag, Image, Input, Select, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { fetchProducts, deleteProduct, setFilters, clearFilters } from '../../redux/slices/productSlice';
import { showConfirm } from '../../utils/notifications';
import ProductDetail from './ProductDetail';
import ProductForm from './ProductForm';
import { fetchCategories } from '../../redux/slices/categorySlice';

const ProductList = () => {
    const dispatch = useDispatch();
    const { filteredItems, loading, filters } = useSelector((state) => state.products);
    const { items: categories } = useSelector((state) => state.categories);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);

    useEffect(() => {
        dispatch(fetchProducts());
        dispatch(fetchCategories());
    }, [dispatch]);

    const handleDelete = async (productId) => {
        const confirmed = await showConfirm(
            'Esta acción no se puede deshacer',
            '¿Eliminar producto?'
        );
        if (confirmed) {
            dispatch(deleteProduct(productId));
        }
    };

    const handleView = (product) => {
        setSelectedProduct(product);
        setDetailModalOpen(true);
    };

    const handleEdit = (product) => {
        setProductToEdit(product);
        setEditModalOpen(true);
    };

    const handleFilterChange = (field, value) => {
        dispatch(setFilters({ [field]: value }));
    };

    const handleClearFilters = () => {
        dispatch(clearFilters());
    };

    const columns = [
        {
            title: 'Imagen',
            dataIndex: 'image_url',
            key: 'image_url',
            width: 80,
            fixed: 'left',
            render: (url) => (
                <Image
                    width={50}
                    height={50}
                    src={url || 'https://via.placeholder.com/50'}
                    alt="Producto"
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                />
            ),
        },
        {
            title: 'ID',
            dataIndex: 'product_id',
            key: 'product_id',
            width: 70,
            responsive: ['md'],
            sorter: (a, b) => a.product_id - b.product_id,
            defaultSortOrder: 'ascend',
        },
        {
            title: 'Título',
            dataIndex: 'title',
            key: 'title',
            render: (text) => <strong>{text}</strong>,
            ellipsis: true,
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: 'Precio',
            dataIndex: 'price',
            key: 'price',
            render: (price) => new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
            }).format(price),
            width: 120,
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'Categoría',
            dataIndex: 'category_name',
            key: 'category_name',
            render: (text) => <Tag color="blue">{text}</Tag>,
            responsive: ['lg'],
            sorter: (a, b) => (a.category_name || '').localeCompare(b.category_name || ''),
        },
        {
            title: 'Rating',
            dataIndex: 'rating_score',
            key: 'rating_score',
            responsive: ['lg'],
            render: (score, record) => (
                score ? (
                    <Space>
                        <Tag color="gold">⭐ {score}</Tag>
                        <span style={{ fontSize: 12, color: '#888' }}>
                            ({record.review_count} reviews)
                        </span>
                    </Space>
                ) : (
                    <Tag>Sin rating</Tag>
                )
            ),
            sorter: (a, b) => (a.rating_score || 0) - (b.rating_score || 0),
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 180,
            fixed: 'right',
            render: (_, record) => (
                <Space wrap>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        <span className="btn-text-sm">Ver</span>
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        <span className="btn-text-sm">Editar</span>
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.product_id)}
                    >
                        <span className="btn-text-sm">Eliminar</span>
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Card title="Lista de Productos" bordered={false}>
                {/* Filtros */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Buscar por nombre..."
                            prefix={<SearchOutlined />}
                            value={filters.name}
                            onChange={(e) => handleFilterChange('name', e.target.value)}
                            allowClear
                            size="large"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Select
                            placeholder="Filtrar por categoría"
                            value={filters.categoryId}
                            onChange={(value) => handleFilterChange('categoryId', value)}
                            allowClear
                            style={{ width: '100%' }}
                            size="large"
                            options={(categories || []).map(cat => ({
                                label: cat.category_name,
                                value: cat.category_id
                            }))}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Button onClick={handleClearFilters} size="large">
                            Limpiar Filtros
                        </Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={filteredItems}
                    rowKey="product_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Total: ${total} productos`,
                    }}
                    scroll={{ x: 1200 }}
                    responsive
                />
            </Card>

            {/* Modal Detalle */}
            <ProductDetail
                product={selectedProduct}
                open={detailModalOpen}
                onClose={() => {
                    setDetailModalOpen(false);
                    setSelectedProduct(null);
                }}
            />

            {/* Modal Editar */}
            <ProductForm
                open={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setProductToEdit(null);
                }}
                productToEdit={productToEdit}
            />
        </>
    );
};

export default ProductList;