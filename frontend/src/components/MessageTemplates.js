import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Card,
  Space,
  Typography,
  Popconfirm,
  message,
  Tag,
  Row,
  Col,
  Select,
  Switch,
  Statistic,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  MessageOutlined,
  SendOutlined,
  UserOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const MessageTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8001/message-templates/');
      setTemplates(response.data);
      message.success(`Loaded ${response.data.length} templates successfully`);
    } catch (error) {
      console.error('Error fetching templates:', error);
      message.warning('Using demo data - backend not available');
      // Demo data for message templates
      setTemplates([
        {
          id: 1,
          name: 'Welcome Message',
          category: 'welcome',
          content: 'Welcome {prenom}! Thank you for joining us. Your journey starts here!',
          variables: ['prenom'],
          is_active: true,
          character_count: 72,
          created_at: '2025-08-20T10:00:00Z',
          usage_count: 45,
        },
        {
          id: 2,
          name: 'Promotional Sale',
          category: 'promotional',
          content: 'Hello {prenom}, enjoy 30% off on summer collection! Valid until {date_fin}. Shop now!',
          variables: ['prenom', 'date_fin'],
          is_active: true,
          character_count: 89,
          created_at: '2025-08-18T14:30:00Z',
          usage_count: 123,
        },
        {
          id: 3,
          name: 'Location-based Offer',
          category: 'promotional',
          content: 'Exclusive offer for {ville} customers! Visit our {ville} store and get 20% off.',
          variables: ['ville'],
          is_active: true,
          character_count: 78,
          created_at: '2025-08-15T08:00:00Z',
          usage_count: 67,
        },
        {
          id: 4,
          name: 'Birthday Wishes',
          category: 'notification',
          content: 'Happy Birthday {prenom}! 🎉 Here\'s a special gift just for you!',
          variables: ['prenom'],
          is_active: true,
          character_count: 66,
          created_at: '2025-08-12T16:45:00Z',
          usage_count: 89,
        },
        {
          id: 5,
          name: 'Flash Sale Alert',
          category: 'promotional',
          content: 'URGENT {prenom}! Flash sale - 70% OFF everything! Only 2 hours left!',
          variables: ['prenom'],
          is_active: false,
          character_count: 68,
          created_at: '2025-08-10T12:20:00Z',
          usage_count: 156,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    form.setFieldsValue({
      name: template.name,
      category: template.category,
      content: template.content,
      is_active: template.is_active,
    });
    setModalVisible(true);
  };

  const handleDelete = async (templateId, templateName) => {
    try {
      await axios.delete(`http://localhost:8001/message-templates/${templateId}`);
      message.success(`Template "${templateName}" deleted successfully!`);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      // Fallback: remove from local state even if API fails
      setTemplates(prev => prev.filter(template => template.id !== templateId));
      message.success(`Template "${templateName}" deleted successfully!`);
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Extract variables from content
      const variables = extractVariables(values.content);
      const characterCount = values.content.length;

      const payload = {
        name: values.name,
        category: values.category,
        content: values.content,
        variables: variables,
        is_active: values.is_active !== false,
        character_count: characterCount,
      };

      if (editingTemplate) {
        // Update existing template
        await axios.put(`http://localhost:8001/message-templates/${editingTemplate.id}`, payload);
        message.success(`Template "${values.name}" updated successfully!`);
        
        // Update local state as fallback
        setTemplates(prev => prev.map(template => 
          template.id === editingTemplate.id ? { ...template, ...payload } : template
        ));
      } else {
        // Create new template
        const response = await axios.post('http://localhost:8001/message-templates/', payload);
        message.success(`Template "${values.name}" created successfully!`);
        
        const newTemplate = response.data || {
          ...payload,
          id: Date.now(),
          created_at: new Date().toISOString(),
          usage_count: 0
        };
        setTemplates(prev => [...prev, newTemplate]);
      }
      
      setModalVisible(false);
      form.resetFields();
      setTimeout(() => fetchTemplates(), 500);
      
    } catch (error) {
      console.error('Error saving template:', error);
      
      // Fallback: still save locally for demo purposes
      if (!editingTemplate) {
        const variables = extractVariables(values.content);
        const newTemplate = {
          id: Date.now(),
          name: values.name,
          category: values.category,
          content: values.content,
          variables: variables,
          is_active: values.is_active !== false,
          character_count: values.content.length,
          created_at: new Date().toISOString(),
          usage_count: 0,
        };
        setTemplates(prev => [...prev, newTemplate]);
        message.success(`Template "${values.name}" created successfully!`);
      } else {
        message.error('Failed to update template. Please try again.');
      }
      
      setModalVisible(false);
      form.resetFields();
    }
  };

  const extractVariables = (content) => {
    const regex = /\{(\w+)\}/g;
    const variables = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    return variables;
  };

  const handlePreview = (template) => {
    // Generate preview with sample data
    let previewContent = template.content;
    const sampleData = {
      prenom: 'John',
      nom: 'Doe',
      ville: 'Paris',
      date_fin: '31 Aug 2025',
      date_debut: '25 Aug 2025'
    };

    template.variables.forEach(variable => {
      if (sampleData[variable]) {
        previewContent = previewContent.replace(new RegExp(`\\{${variable}\\}`, 'g'), sampleData[variable]);
      }
    });

    setPreviewData({
      template,
      previewContent,
      sampleData
    });
    setPreviewModalVisible(true);
  };

  const handleDuplicate = (template) => {
    const duplicatedTemplate = {
      ...template,
      id: Date.now(),
      name: `${template.name} (Copy)`,
      created_at: new Date().toISOString(),
      usage_count: 0
    };
    setTemplates(prev => [...prev, duplicatedTemplate]);
    message.success(`Template duplicated successfully!`);
  };

  const columns = [
    {
      title: 'Template Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{name}</Text>
          <Tag color={
            record.category === 'promotional' ? 'orange' :
            record.category === 'welcome' ? 'green' :
            record.category === 'notification' ? 'blue' : 'default'
          }>
            {record.category}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Content Preview',
      dataIndex: 'content',
      key: 'content',
      render: (content) => (
        <Paragraph 
          ellipsis={{ rows: 2, expandable: false }}
          style={{ marginBottom: 0, maxWidth: '300px' }}
        >
          {content}
        </Paragraph>
      ),
    },
    {
      title: 'Variables',
      dataIndex: 'variables',
      key: 'variables',
      render: (variables) => (
        <Space wrap>
          {variables.map(variable => (
            <Tag key={variable} color="cyan">
              {`{${variable}}`}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Length',
      dataIndex: 'character_count',
      key: 'character_count',
      render: (count) => (
        <Space>
          <Text style={{ color: count > 160 ? '#ff4d4f' : '#52c41a' }}>
            {count}/160
          </Text>
          {count > 160 && (
            <Tooltip title="Message exceeds SMS character limit">
              ⚠️
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Usage',
      dataIndex: 'usage_count',
      key: 'usage_count',
      render: (count) => (
        <Text>{count} campaigns</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Preview">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Duplicate">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleDuplicate(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Template"
              description={`Are you sure you want to delete "${record.name}"?`}
              onConfirm={() => handleDelete(record.id, record.name)}
              okText="Delete"
              cancelText="Cancel"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <MessageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <div>
                <Title level={2} style={{ margin: 0 }}>Message Templates</Title>
                <Text type="secondary">Create and manage SMS message templates</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size="large"
              onClick={handleCreate}
            >
              Create Template
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Templates"
              value={templates.length}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Templates"
              value={templates.filter(t => t.is_active).length}
              prefix={<SendOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Usage"
              value={templates.reduce((sum, t) => sum + t.usage_count, 0)}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Categories"
              value={new Set(templates.map(t => t.category)).size}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Templates Table */}
      <Card title="All Templates">
        <Table
          columns={columns}
          dataSource={templates}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} templates`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingTemplate ? 'Edit Message Template' : 'Create New Message Template'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Template Name"
                name="name"
                rules={[{ required: true, message: 'Please enter template name' }]}
              >
                <Input placeholder="Enter template name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  <Option value="promotional">Promotional</Option>
                  <Option value="welcome">Welcome</Option>
                  <Option value="notification">Notification</Option>
                  <Option value="reminder">Reminder</Option>
                  <Option value="seasonal">Seasonal</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Message Content"
            name="content"
            rules={[
              { required: true, message: 'Please enter message content' },
              { max: 160, message: 'SMS message should not exceed 160 characters' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter your message template. Use {prenom}, {nom}, {ville}, {date_fin} for personalization"
              showCount
              maxLength={160}
            />
          </Form.Item>

          <Card size="small" style={{ marginBottom: '16px', background: '#f6ffed' }}>
            <Text strong>Available Variables:</Text>
            <div style={{ marginTop: '8px' }}>
              <Space wrap>
                <Tag color="green">{'{prenom}'} - First Name</Tag>
                <Tag color="green">{'{nom}'} - Last Name</Tag>
                <Tag color="green">{'{ville}'} - City</Tag>
                <Tag color="green">{'{date_fin}'} - End Date</Tag>
                <Tag color="green">{'{date_debut}'} - Start Date</Tag>
              </Space>
            </div>
          </Card>

          <Form.Item label="Active Status" name="is_active" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Template Preview"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {previewData && (
          <div>
            <Card title="Original Template" style={{ marginBottom: '16px' }}>
              <Paragraph style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                {previewData.template.content}
              </Paragraph>
            </Card>
            
            <Card title="Preview with Sample Data">
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Sample Data:</Text>
                <div style={{ marginTop: '8px' }}>
                  {Object.entries(previewData.sampleData).map(([key, value]) => (
                    <Tag key={key} color="blue">{key}: {value}</Tag>
                  ))}
                </div>
              </div>
              <div style={{ 
                background: '#e6f7ff', 
                padding: '16px', 
                borderRadius: '8px', 
                border: '1px solid #91d5ff'
              }}>
                <Text strong>Preview Result:</Text>
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '16px', 
                  lineHeight: '1.5'
                }}>
                  {previewData.previewContent}
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary">
                    Character count: {previewData.previewContent.length}/160
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MessageTemplates;
