import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Table, Tag, Space } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { fetchCategories } from '../../redux/slices/categorySlice';
import dayjs from 'dayjs';

const CategoryList = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'category_id',
      key: 'category_id',
      width: 80,
      responsive: ['md'],
    },
    {
      title: 'Nombre',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (text) => (
        <Space>
          <TagOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Fecha de Creación',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      responsive: ['lg'],
    },
    {
      title: 'Estado',
      key: 'status',
      render: () => <Tag color="green">Activa</Tag>,
      responsive: ['sm'],
    },
  ];

  return (
    <Card title="Lista de Categorías" bordered={false}>
      <Table
        columns={columns}
        dataSource={items}
        rowKey="category_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Total: ${total} categorías`,
        }}
        scroll={{ x: 600 }}
        responsive
      />
    </Card>
  );
};

export default CategoryList;