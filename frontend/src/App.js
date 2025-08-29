import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography, Button, Avatar, Dropdown, Space, Badge, notification, message } from 'antd';
import {
  DashboardOutlined,
  ContactsOutlined,
  MessageOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  BellOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Dashboard from './components/EnhancedDashboard';
import ContactManagement from './components/ContactManagement';
import CampaignManagement from './components/CampaignManagement';
import MessageTemplates from './components/MessageTemplates';
import MailingListManagement from './components/MailingListManagement';
import Analytics from './components/Analytics';
import Settings from './components/ProfessionalSettings';
import Login from './components/Login';
import './App.css';
import './styles/professional.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Campaign "Summer Sale" completed successfully', time: '2 min ago' },
    { id: 2, message: 'New contact added: John Doe', time: '15 min ago' },
    { id: 3, message: 'Weekly analytics report ready', time: '1 hour ago' }
  ]);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }

    // Set up notification system
    notification.config({
      placement: 'topRight',
      duration: 4.5,
    });

    // Listen for navigation events from components
    const handleNavigation = (event) => {
      setSelectedKey(event.detail.key);
    };

    window.addEventListener('navigateTo', handleNavigation);

    // Simulate real-time notifications
    const notificationInterval = setInterval(() => {
      const newNotifications = [
        'Campaign "Flash Sale" delivered to 1,234 contacts',
        'New contact added: Sarah Johnson',
        'SMS delivery rate: 97.8% (above target)',
        'Weekly report is ready for review',
        'API usage: 85% of monthly limit',
        'Contact list "Premium VIP" updated',
      ];
      
      const randomNotification = newNotifications[Math.floor(Math.random() * newNotifications.length)];
      const newId = Date.now();
      
      setNotifications(prev => [
        { 
          id: newId, 
          message: randomNotification, 
          time: 'Just now' 
        },
        ...prev.slice(0, 4) // Keep only 5 notifications
      ]);
    }, 30000); // New notification every 30 seconds

    return () => {
      window.removeEventListener('navigateTo', handleNavigation);
      clearInterval(notificationInterval);
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    notification.success({
      message: 'Login Successful',
      description: `Welcome back, ${userData.name}!`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    notification.info({
      message: 'Logged Out',
      description: 'You have been successfully logged out',
    });
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile Settings',
      onClick: () => {
        message.info('Opening profile settings...');
        setSelectedKey('7');
      },
    },
    {
      key: 'notifications',
      icon: <BellOutlined />,
      label: 'Notification Settings',
      onClick: () => {
        message.info('Opening notification settings...');
        setSelectedKey('7');
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const notificationMenuItems = notifications.map(notif => ({
    key: notif.id,
    label: (
      <div style={{ maxWidth: '280px' }}>
        <div style={{ fontWeight: 500, marginBottom: '4px' }}>{notif.message}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{notif.time}</div>
      </div>
    ),
    onClick: () => {
      message.info(`Notification clicked: ${notif.message.substring(0, 30)}...`);
      // Mark as read or handle notification click
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    },
  }));

  // If user is not logged in, show login screen
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '2',
      icon: <ContactsOutlined />,
      label: 'Contacts',
    },
    {
      key: '3',
      icon: <MessageOutlined />,
      label: 'Campaigns',
    },
    {
      key: '4',
      icon: <FileTextOutlined />,
      label: 'Templates',
    },
    {
      key: '5',
      icon: <TeamOutlined />,
      label: 'Mailing Lists',
    },
    {
      key: '6',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: '7',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <Dashboard />;
      case '2':
        return <ContactManagement />;
      case '3':
        return <CampaignManagement />;
      case '4':
        return <MessageTemplates />;
      case '5':
        return <MailingListManagement />;
      case '6':
        return <Analytics />;
      case '7':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div style={{ 
          padding: '16px', 
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            {collapsed ? 'SMS' : 'SMS Platform'}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            <Typography.Title level={4} style={{ margin: 0, marginLeft: '16px', color: '#1890ff' }}>
              📱 SMS Campaign Pro
            </Typography.Title>
          </div>
          
          <Space size="middle">
            {/* Notification Bell */}
            <Dropdown
              menu={{
                items: [
                  ...notificationMenuItems,
                  {
                    type: 'divider',
                  },
                  {
                    key: 'all',
                    label: 'View All Notifications',
                    onClick: () => {
                      message.success('All notifications displayed!');
                      setSelectedKey('7'); // Navigate to settings where notifications could be managed
                    },
                  },
                ],
              }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Badge count={notifications.length} size="small">
                <Button type="text" icon={<BellOutlined />} style={{ fontSize: '16px' }} />
              </Badge>
            </Dropdown>

            {/* User Profile */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer', padding: '0 8px' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{user.name}</span>
                  <span style={{ fontSize: '12px', color: '#666' }}>{user.role}</span>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
