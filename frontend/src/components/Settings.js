import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Divider,
  Typography,
  Row,
  Col,
  message,
  Tabs,
  Table,
  Space,
  Modal,
  Popconfirm,
} from 'antd';
import {
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Settings = () => {
  const [form] = Form.useForm();
  const [userForm] = Form.useForm();
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Mock data for users
  const [users, setUsers] = useState([
    {
      id: 1,
      nom_utilisateur: 'admin',
      email: 'admin@smsplatform.com',
      role: 'admin',
      date_creation: '2025-08-01',
      last_login: '2025-08-26',
    },
    {
      id: 2,
      nom_utilisateur: 'operator1',
      email: 'operator1@smsplatform.com',
      role: 'operator',
      date_creation: '2025-08-15',
      last_login: '2025-08-25',
    },
  ]);

  const handleSaveSettings = (values) => {
    console.log('Saving settings:', values);
    message.success('Settings saved successfully');
  };

  const handleAddUser = () => {
    setEditingUser(null);
    userForm.resetFields();
    setUserModalVisible(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    userForm.setFieldsValue(user);
    setUserModalVisible(true);
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    message.success('User deleted successfully');
  };

  const handleUserSubmit = (values) => {
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...values }
          : user
      ));
      message.success('User updated successfully');
    } else {
      const newUser = {
        id: users.length + 1,
        ...values,
        date_creation: new Date().toISOString().split('T')[0],
        last_login: '-',
      };
      setUsers([...users, newUser]);
      message.success('User created successfully');
    }
    setUserModalVisible(false);
  };

  const userColumns = [
    {
      title: 'Username',
      dataIndex: 'nom_utilisateur',
      key: 'nom_utilisateur',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <span style={{ 
          color: role === 'admin' ? '#f5222d' : '#1890ff',
          fontWeight: 'bold'
        }}>
          {role.toUpperCase()}
        </span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'date_creation',
      key: 'date_creation',
    },
    {
      title: 'Last Login',
      dataIndex: 'last_login',
      key: 'last_login',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'general',
      label: (
        <span>
          <SettingOutlined />
          General
        </span>
      ),
      children: (
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveSettings}
            initialValues={{
              company_name: 'SMS Campaign Platform',
              timezone: 'Europe/Paris',
              default_sender: '+33123456789',
              daily_limit: 10000,
              rate_limit: 100,
              auto_opt_out: true,
              send_confirmations: true,
              enable_analytics: true,
            }}
          >
            <Title level={4}>Company Information</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Company Name"
                  name="company_name"
                  rules={[{ required: true, message: 'Please enter company name' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Timezone"
                  name="timezone"
                  rules={[{ required: true, message: 'Please select timezone' }]}
                >
                  <Select>
                    <Option value="Europe/Paris">Europe/Paris</Option>
                    <Option value="Europe/London">Europe/London</Option>
                    <Option value="America/New_York">America/New_York</Option>
                    <Option value="Asia/Tokyo">Asia/Tokyo</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Title level={4}>SMS Configuration</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Default Sender ID"
                  name="default_sender"
                  rules={[{ required: true, message: 'Please enter default sender' }]}
                >
                  <Input placeholder="+33123456789" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="API Provider"
                  name="api_provider"
                >
                  <Select placeholder="Select SMS provider">
                    <Option value="twilio">Twilio</Option>
                    <Option value="nexmo">Vonage (Nexmo)</Option>
                    <Option value="plivo">Plivo</Option>
                    <Option value="clickatell">Clickatell</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Daily Sending Limit"
                  name="daily_limit"
                  rules={[{ required: true, message: 'Please enter daily limit' }]}
                >
                  <Input type="number" addonAfter="messages" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Rate Limit (per minute)"
                  name="rate_limit"
                  rules={[{ required: true, message: 'Please enter rate limit' }]}
                >
                  <Input type="number" addonAfter="messages/min" />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Title level={4}>Compliance & Privacy</Title>
            <Form.Item
              label="Auto Opt-out Keywords"
              name="opt_out_keywords"
            >
              <TextArea 
                rows={3} 
                placeholder="STOP, UNSUBSCRIBE, QUIT (comma-separated)"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Auto Opt-out Processing"
                  name="auto_opt_out"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Send Delivery Confirmations"
                  name="send_confirmations"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Enable Analytics Tracking"
                  name="enable_analytics"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Save Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          User Management
        </span>
      ),
      children: (
        <Card>
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Col>
              <Title level={4}>User Management</Title>
              <Text type="secondary">Manage user accounts and permissions</Text>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddUser}
              >
                Add User
              </Button>
            </Col>
          </Row>

          <Table
            columns={userColumns}
            dataSource={users}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
          />
        </Card>
      ),
    },
    {
      key: 'api',
      label: (
        <span>
          <KeyOutlined />
          API Keys
        </span>
      ),
      children: (
        <Card>
          <Title level={4}>API Configuration</Title>
          <Text type="secondary">Configure your SMS provider API keys</Text>
          
          <Form layout="vertical" style={{ marginTop: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Twilio Account SID">
                  <Input.Password placeholder="Enter Twilio Account SID" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Twilio Auth Token">
                  <Input.Password placeholder="Enter Twilio Auth Token" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Vonage API Key">
                  <Input.Password placeholder="Enter Vonage API Key" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Vonage API Secret">
                  <Input.Password placeholder="Enter Vonage API Secret" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button type="primary" icon={<SaveOutlined />}>
                  Save API Keys
                </Button>
                <Button>
                  Test Connection
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          Notifications
        </span>
      ),
      children: (
        <Card>
          <Title level={4}>Notification Settings</Title>
          <Text type="secondary">Configure system notifications and alerts</Text>
          
          <Form layout="vertical" style={{ marginTop: 24 }}>
            <Title level={5}>Email Notifications</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Campaign Completion">
                  <Switch defaultChecked />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Daily Reports">
                  <Switch defaultChecked />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Error Alerts">
                  <Switch defaultChecked />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Low Credit Alerts">
                  <Switch defaultChecked />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="API Failures">
                  <Switch defaultChecked />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Weekly Summary">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Title level={5}>Notification Recipients</Title>
            <Form.Item label="Admin Email">
              <Input placeholder="admin@yourcompany.com" />
            </Form.Item>
            <Form.Item label="Technical Contact">
              <Input placeholder="tech@yourcompany.com" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" icon={<SaveOutlined />}>
                Save Notification Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Settings</Title>
      
      <Tabs
        defaultActiveKey="general"
        items={tabItems}
        style={{ marginTop: 16 }}
      />

      {/* User Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Add New User'}
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleUserSubmit}
        >
          <Form.Item
            label="Username"
            name="nom_utilisateur"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="operator">Operator</Option>
              <Option value="viewer">Viewer</Option>
            </Select>
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="Password"
              name="mot_de_passe"
              rules={[{ required: true, message: 'Please enter password' }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Update' : 'Create'} User
              </Button>
              <Button onClick={() => setUserModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings;
