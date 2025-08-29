import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Typography,
  Row,
  Col,
  Divider,
  Alert,
  InputNumber,
  Upload,
  Avatar,
  Space,
  Tabs,
  Table,
  Tag,
  Modal,
  message,
} from 'antd';
import {
  UserOutlined,
  BellOutlined,
  ApiOutlined,
  TeamOutlined,
  UploadOutlined,
  KeyOutlined,
  MailOutlined,
  WhatsAppOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  InstagramOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [inviteStep, setInviteStep] = useState(1); // 1: Select Platform, 2: Confirm Invitation
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [userData, setUserData] = useState(null);
  
  const [profileForm] = Form.useForm();
  const [notificationForm] = Form.useForm();

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData(user);
        
        // Set form values with user data
        profileForm.setFieldsValue({
          firstName: user.firstName || user.name?.split(' ')[0] || '',
          lastName: user.lastName || user.name?.split(' ')[1] || '',
          email: user.email || '',
          phone: user.phone || '',
          company: user.company || 'SMS Pro Solutions',
          role: user.role || 'Campaign Manager',
          timezone: 'UTC-5', // Default timezone
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [profileForm]);

  const handleSaveProfile = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data in localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        firstName: values.firstName,
        lastName: values.lastName,
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phone: values.phone,
        company: values.company,
        role: values.role,
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      
      // In a real app, you would upload the profileImage file to your backend here
      if (profileImage) {
        console.log('Profile image to upload:', profileImage);
      }
      
      message.success('Profile settings saved successfully!');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Notification settings updated successfully!');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    
    if (info.file.status === 'done' || info.file.originFileObj) {
      // Get file and create preview
      const file = info.file.originFileObj || info.file;
      if (file) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          setImagePreview(reader.result);
          setProfileImage(file);
          setLoading(false);
          message.success('Photo uploaded successfully!');
        });
        reader.readAsDataURL(file);
      }
    }
    
    if (info.file.status === 'error') {
      message.error('Photo upload failed!');
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return false;
    }
    return false; // Don't auto-upload, handle manually
  };

  const uploadProps = {
    name: 'avatar',
    listType: 'picture',
    showUploadList: false,
    beforeUpload: beforeUpload,
    onChange: handlePhotoChange,
    accept: 'image/*',
  };

  // Social Media Platforms for Invitations
  const socialPlatforms = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <WhatsAppOutlined />,
      color: '#25D366',
      shareUrl: (inviteLink) => `https://wa.me/?text=${encodeURIComponent(`Join our SMS Campaign Pro team! ${inviteLink}`)}`
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <FacebookOutlined />,
      color: '#1877F2',
      shareUrl: (inviteLink) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <TwitterOutlined />,
      color: '#1DA1F2',
      shareUrl: (inviteLink) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join our SMS Campaign Pro team! ${inviteLink}`)}`
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <LinkedinOutlined />,
      color: '#0077B5',
      shareUrl: (inviteLink) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(inviteLink)}`
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <InstagramOutlined />,
      color: '#E4405F',
      shareUrl: (inviteLink) => `https://www.instagram.com/` // Note: Instagram doesn't support direct URL sharing
    },
    {
      id: 'email',
      name: 'Email',
      icon: <MailOutlined />,
      color: '#0073E6',
      shareUrl: (inviteLink) => `mailto:?subject=Join SMS Campaign Pro&body=${encodeURIComponent(`You're invited to join our SMS Campaign Pro team! Click here: ${inviteLink}`)}`
    }
  ];

  const handleInviteMember = () => {
    setInviteModalVisible(true);
    setInviteStep(1);
    setSelectedPlatform(null);
  };

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    setInviteStep(2);
    
    // Generate invite link (in real app, this would come from backend)
    const inviteLink = `https://sms-campaign-pro.com/invite?token=${Math.random().toString(36).substring(7)}`;
    
    // Open the selected platform
    const shareUrl = platform.shareUrl(inviteLink);
    window.open(shareUrl, '_blank');
    
    message.success(`Opening ${platform.name} to share invitation...`);
  };

  const handleConfirmInvitation = () => {
    if (!inviteEmail || !inviteName) {
      message.warning('Please fill in all fields!');
      return;
    }

    // Simulate sending invitation
    message.loading('Sending invitation...', 1.5);
    
    setTimeout(() => {
      message.success(`Invitation sent successfully to ${inviteName} via ${selectedPlatform.name}!`);
      setInviteModalVisible(false);
      setInviteStep(1);
      setSelectedPlatform(null);
      setInviteEmail('');
      setInviteName('');
      
      // Add the invited member to the team data (in real app, this would update the backend)
      // This is just for demonstration
    }, 1500);
  };

  const apiKeyColumns = [
    {
      title: 'Key Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
    },
    {
      title: 'Last Used',
      dataIndex: 'lastUsed',
      key: 'lastUsed',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link" size="small">Edit</Button>
          <Button type="link" size="small" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  const apiKeyData = [
    {
      key: '1',
      name: 'Production API Key',
      created: '2025-01-15',
      lastUsed: '2025-08-27',
      status: 'active',
    },
    {
      key: '2',
      name: 'Development API Key',
      created: '2025-02-01',
      lastUsed: '2025-08-26',
      status: 'active',
    },
  ];

  const teamColumns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div>{name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link" size="small">Edit</Button>
          <Button type="link" size="small" danger>Remove</Button>
        </Space>
      ),
    },
  ];

  const teamData = [
    {
      key: '1',
      name: 'John Manager',
      email: 'john@company.com',
      role: 'Campaign Manager',
      status: 'active',
      lastLogin: '2 hours ago',
    },
    {
      key: '2',
      name: 'Sarah Admin',
      email: 'sarah@company.com',
      role: 'Administrator',
      status: 'active',
      lastLogin: '1 day ago',
    },
    {
      key: '3',
      name: 'Mike Marketer',
      email: 'mike@company.com',
      role: 'Marketing Specialist',
      status: 'active',
      lastLogin: '3 hours ago',
    },
  ];

  return (
    <div style={{ padding: '0' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>⚙️ Settings</Title>
        <Text type="secondary">
          Configure your SMS Campaign Pro platform settings
        </Text>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" size="large">
        {/* Profile Settings */}
        <TabPane
          tab={
            <span>
              <UserOutlined />
              Profile
            </span>
          }
          key="profile"
        >
          <Card>
            <Row gutter={24}>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <Avatar 
                    size={120} 
                    src={imagePreview}
                    icon={!imagePreview ? <UserOutlined /> : null}
                    style={{ marginBottom: '16px' }} 
                  />
                  <br />
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />} loading={loading}>
                      Change Photo
                    </Button>
                  </Upload>
                  {imagePreview && (
                    <div style={{ marginTop: '8px' }}>
                      <Button 
                        size="small" 
                        type="text" 
                        onClick={() => {
                          setImagePreview(null);
                          setProfileImage(null);
                          message.success('Photo removed');
                        }}
                      >
                        Remove Photo
                      </Button>
                    </div>
                  )}
                </div>
              </Col>
              <Col span={16}>
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleSaveProfile}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="First Name"
                        name="firstName"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Last Name"
                        name="lastName"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, type: 'email' }]}
                  >
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Phone" name="phone">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Company" name="company">
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Role" name="role">
                        <Select>
                          <Option value="admin">Administrator</Option>
                          <Option value="manager">Campaign Manager</Option>
                          <Option value="specialist">Marketing Specialist</Option>
                          <Option value="viewer">Viewer</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Timezone" name="timezone">
                        <Select>
                          <Option value="UTC-8">Pacific Time (UTC-8)</Option>
                          <Option value="UTC-5">Eastern Time (UTC-5)</Option>
                          <Option value="UTC+0">UTC</Option>
                          <Option value="UTC+1">Central European Time (UTC+1)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Save Profile Settings
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Card>
        </TabPane>

        {/* Notification Settings */}
        <TabPane
          tab={
            <span>
              <BellOutlined />
              Notifications
            </span>
          }
          key="notifications"
        >
          <Card title="Email Notifications">
            <Form
              form={notificationForm}
              layout="vertical"
              onFinish={handleSaveNotifications}
              initialValues={{
                campaignCompleted: true,
                campaignFailed: true,
                dailyReports: true,
                weeklyReports: false,
                contactImports: true,
                systemUpdates: false,
                securityAlerts: true,
              }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Title level={5}>Campaign Notifications</Title>
                  <Form.Item name="campaignCompleted" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <div>
                        <div>Campaign Completed</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Get notified when campaigns finish
                        </Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>

                  <Form.Item name="campaignFailed" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <div>
                        <div>Campaign Failed</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Get notified when campaigns fail
                        </Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>

                  <Form.Item name="contactImports" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <div>
                        <div>Contact Imports</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Get notified about contact imports
                        </Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Title level={5}>Report Notifications</Title>
                  <Form.Item name="dailyReports" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <div>
                        <div>Daily Reports</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Receive daily performance reports
                        </Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>

                  <Form.Item name="weeklyReports" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <div>
                        <div>Weekly Reports</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Receive weekly performance summary
                        </Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>

                  <Form.Item name="systemUpdates" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <div>
                        <div>System Updates</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Get notified about platform updates
                        </Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>

                  <Form.Item name="securityAlerts" valuePropName="checked">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <div>
                        <div>Security Alerts</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Important security notifications
                        </Text>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Save Notification Settings
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        {/* API Keys */}
        <TabPane
          tab={
            <span>
              <KeyOutlined />
              API Keys
            </span>
          }
          key="api"
        >
          <Card
            title="API Key Management"
            extra={<Button type="primary">Generate New Key</Button>}
          >
            <Alert
              message="API Security"
              description="API keys provide access to your SMS Campaign Pro account. Keep them secure and never share them in client-side code."
              type="warning"
              style={{ marginBottom: '16px' }}
            />

            <Table
              dataSource={apiKeyData}
              columns={apiKeyColumns}
              pagination={false}
            />

            <Divider />

            <Card size="small" title="Rate Limits & Usage">
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', color: '#1890ff' }}>1,250</div>
                    <Text type="secondary">API Calls Today</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', color: '#52c41a' }}>5,000</div>
                    <Text type="secondary">Daily Limit</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', color: '#faad14' }}>25%</div>
                    <Text type="secondary">Usage</Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Card>
        </TabPane>

        {/* Team Management */}
        <TabPane
          tab={
            <span>
              <TeamOutlined />
              Team
            </span>
          }
          key="team"
        >
          <Card
            title="Team Members"
            extra={<Button type="primary" onClick={handleInviteMember}>Invite Member</Button>}
          >
            <Table
              dataSource={teamData}
              columns={teamColumns}
              pagination={false}
            />
          </Card>

          <Card title="Role Permissions" style={{ marginTop: '16px' }}>
            <Row gutter={24}>
              <Col span={6}>
                <Card size="small" title="Administrator" style={{ textAlign: 'center' }}>
                  <Text type="secondary">Full platform access</Text>
                  <ul style={{ textAlign: 'left', marginTop: '8px', fontSize: '12px' }}>
                    <li>Manage all campaigns</li>
                    <li>Manage team members</li>
                    <li>Access all settings</li>
                    <li>View all analytics</li>
                  </ul>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" title="Campaign Manager" style={{ textAlign: 'center' }}>
                  <Text type="secondary">Campaign management</Text>
                  <ul style={{ textAlign: 'left', marginTop: '8px', fontSize: '12px' }}>
                    <li>Create campaigns</li>
                    <li>Manage contacts</li>
                    <li>View campaign analytics</li>
                    <li>Limited settings access</li>
                  </ul>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" title="Marketing Specialist" style={{ textAlign: 'center' }}>
                  <Text type="secondary">Content creation</Text>
                  <ul style={{ textAlign: 'left', marginTop: '8px', fontSize: '12px' }}>
                    <li>Create campaigns</li>
                    <li>Edit campaign content</li>
                    <li>View assigned analytics</li>
                    <li>No settings access</li>
                  </ul>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" title="Viewer" style={{ textAlign: 'center' }}>
                  <Text type="secondary">Read-only access</Text>
                  <ul style={{ textAlign: 'left', marginTop: '8px', fontSize: '12px' }}>
                    <li>View campaigns</li>
                    <li>View contacts</li>
                    <li>View analytics</li>
                    <li>No editing permissions</li>
                  </ul>
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      {/* Social Media Invitation Modal */}
      <Modal
        title="Invite Team Member"
        visible={inviteModalVisible}
        onCancel={() => {
          setInviteModalVisible(false);
          setInviteStep(1);
          setSelectedPlatform(null);
          setInviteEmail('');
          setInviteName('');
        }}
        footer={null}
        width={600}
      >
        {inviteStep === 1 && (
          <div>
            <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
              Choose a platform to send invitation
            </Title>
            <Row gutter={[16, 16]}>
              {socialPlatforms.map((platform) => (
                <Col span={8} key={platform.id}>
                  <Card
                    hoverable
                    style={{ 
                      textAlign: 'center', 
                      borderColor: platform.color,
                      cursor: 'pointer'
                    }}
                    onClick={() => handlePlatformSelect(platform)}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div style={{ fontSize: '32px', color: platform.color, marginBottom: 8 }}>
                      {platform.icon}
                    </div>
                    <Text strong>{platform.name}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {inviteStep === 2 && selectedPlatform && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: '48px', color: selectedPlatform.color, marginBottom: 16 }}>
                {selectedPlatform.icon}
              </div>
              <Title level={3}>Inviting via {selectedPlatform.name}</Title>
              <Text type="secondary">
                The invitation link has been opened in {selectedPlatform.name}. 
                Please complete the invitation and fill in the details below.
              </Text>
            </div>

            <Form layout="vertical">
              <Form.Item label="Invitee's Name" required>
                <Input
                  placeholder="Enter the name of the person you're inviting"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Invitee's Email" required>
                <Input
                  type="email"
                  placeholder="Enter their email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </Form.Item>
            </Form>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Space>
                <Button 
                  onClick={() => {
                    setInviteStep(1);
                    setSelectedPlatform(null);
                  }}
                >
                  Back to Platforms
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleConfirmInvitation}
                  disabled={!inviteEmail || !inviteName}
                >
                  Confirm Invitation Sent
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Settings;
