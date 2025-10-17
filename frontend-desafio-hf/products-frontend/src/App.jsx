import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import HomePage from './pages/HomePage';
import './App.css';

function App() {
  return (
    <ConfigProvider
      locale={esES}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <HomePage />
    </ConfigProvider>
  );
}

export default App;