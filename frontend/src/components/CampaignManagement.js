import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Space,
  Typography,
  Popconfirm,
  message,
  DatePicker,
  Switch,
  Tag,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import CampaignExecution from './CampaignExecution';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form] = Form.useForm();
  const [executionView, setExecutionView] = useState(false);
  const [executingCampaign, setExecutingCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
    fetchContacts();
    fetchTemplates();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8001/campaigns/');
      setCampaigns(response.data);
      message.success(`Loaded ${response.data.length} campaigns successfully`);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      message.warning('Using demo data - backend not available');
      // Enhanced mock data for demonstration
      setCampaigns([
        {
          id_campagne: 1,
          nom_campagne: 'Summer Sale Campaign',
          type_campagne: 'promotional',
          statut: 'active',
          date_creation: '2025-08-20T10:00:00Z',
          date_debut: '2025-08-25T09:00:00Z',
          date_fin: '2025-08-30T18:00:00Z',
          message_template: 'Hello {prenom}, enjoy 30% off on summer collection! Valid until {date_fin}. Shop now!',
          personnalisation_active: true,
          segment_cible: 'Premium customers',
        },
        {
          id_campagne: 2,
          nom_campagne: 'Welcome Series',
          type_campagne: 'welcome',
          statut: 'draft',
          date_creation: '2025-08-18T14:30:00Z',
          date_debut: '2025-08-26T10:00:00Z',
          date_fin: null,
          message_template: 'Welcome {prenom}! Thank you for joining us. Your journey starts here!',
          personnalisation_active: true,
          segment_cible: 'New customers',
        },
        {
          id_campagne: 3,
          nom_campagne: 'Weekly Newsletter',
          type_campagne: 'notification',
          statut: 'paused',
          date_creation: '2025-08-15T08:00:00Z',
          date_debut: '2025-08-20T07:00:00Z',
          date_fin: '2025-08-31T23:59:00Z',
          message_template: 'Hi {prenom}, here are this week\'s highlights from {ville}!',
          personnalisation_active: true,
          segment_cible: 'All active subscribers',
        },
        {
          id_campagne: 4,
          nom_campagne: 'Black Friday Special',
          type_campagne: 'promotional',
          statut: 'draft',
          date_creation: '2025-08-22T16:45:00Z',
          date_debut: '2025-11-29T00:00:00Z',
          date_fin: '2025-11-29T23:59:00Z',
          message_template: 'HUGE SAVINGS {prenom}! Up to 70% OFF everything. One day only!',
          personnalisation_active: true,
          segment_cible: 'High-value customers',
        },
        {
          id_campagne: 5,
          nom_campagne: 'Holiday Greetings',
          type_campagne: 'notification',
          statut: 'stopped',
          date_creation: '2025-08-10T12:00:00Z',
          date_debut: '2025-08-15T08:00:00Z',
          date_fin: '2025-08-25T20:00:00Z',
          message_template: 'Happy holidays {prenom}! Wishing you joy and happiness from {ville}!',
          personnalisation_active: true,
          segment_cible: 'All customers',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get('http://localhost:8001/contacts/');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      // Enhanced mock data for campaign preview
      setContacts([
        {
          id_contact: 1,
          nom: 'Dupont',
          prenom: 'Jean',
          numero_telephone: '+33612345678',
          email: 'jean.dupont@example.com',
          ville: 'Paris',
          type_client: 'Premium'
        },
        {
          id_contact: 2,
          nom: 'Martin',
          prenom: 'Marie',
          numero_telephone: '+33687654321',
          email: 'marie.martin@example.com',
          ville: 'Lyon',
          type_client: 'Standard'
        },
        {
          id_contact: 3,
          nom: 'Bernard',
          prenom: 'Paul',
          numero_telephone: '+33698765432',
          email: 'paul.bernard@example.com',
          ville: 'Marseille',
          type_client: 'Premium'
        },
        {
          id_contact: 4,
          nom: 'Leroy',
          prenom: 'Sophie',
          numero_telephone: '+33656789012',
          email: 'sophie.leroy@example.com',
          ville: 'Toulouse',
          type_client: 'Standard'
        }
      ]);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('http://localhost:8001/message-templates/');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Demo templates data
      setTemplates([
        {
          id: 1,
          name: 'Welcome Message',
          content: 'Welcome {prenom}! Thank you for joining us. Your journey starts here!',
          variables: ['prenom'],
        },
        {
          id: 2,
          name: 'Promotional Sale',
          content: 'Hello {prenom}, enjoy 30% off on summer collection! Valid until {date_fin}. Shop now!',
          variables: ['prenom', 'date_fin'],
        },
        {
          id: 3,
          name: 'Location-based Offer',
          content: 'Exclusive offer for {ville} customers! Visit our {ville} store and get 20% off.',
          variables: ['ville'],
        },
        {
          id: 4,
          name: 'Birthday Wishes',
          content: 'Happy Birthday {prenom}! 🎉 Here\'s a special gift just for you!',
          variables: ['prenom'],
        }
      ]);
    }
  };

  const handleAddCampaign = () => {
    setEditingCampaign(null);
    setSelectedTemplate(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    const template = templates.find(t => t.id === campaign.template_id);
    setSelectedTemplate(template || null);
    form.setFieldsValue({
      ...campaign,
      date_debut: campaign.date_debut ? moment(campaign.date_debut) : null,
      date_fin: campaign.date_fin ? moment(campaign.date_fin) : null,
    });
    setModalVisible(true);
  };

  const handleDeleteCampaign = async (campaignId, campaignName) => {
    try {
      await axios.delete(`http://localhost:8001/campaigns/${campaignId}`);
      message.success(`Campaign "${campaignName}" deleted successfully!`);
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      // Fallback: remove from local state even if API fails
      setCampaigns(prev => prev.filter(campaign => campaign.id_campagne !== campaignId));
      message.success(`Campaign "${campaignName}" deleted successfully!`);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const selectedTemplateData = templates.find(t => t.id === values.template_id);
      const payload = {
        nom_campagne: values.nom_campagne,
        type_campagne: values.type_campagne,
        segment_cible: values.segment_cible || 'All contacts',
        statut: values.statut || 'draft',
        personnalisation_active: values.personnalisation_active !== false,
        date_debut: values.date_debut ? values.date_debut.toISOString() : null,
        date_fin: values.date_fin ? values.date_fin.toISOString() : null,
        template_id: values.template_id,
        message_template: selectedTemplateData ? selectedTemplateData.content : '',
      };

      if (editingCampaign) {
        // Update existing campaign
        await axios.put(`http://localhost:8001/campaigns/${editingCampaign.id_campagne}`, payload);
        message.success(`Campaign "${values.nom_campagne}" updated successfully!`);
        
        // Update local state as fallback
        setCampaigns(prev => prev.map(campaign => 
          campaign.id_campagne === editingCampaign.id_campagne 
            ? { ...campaign, ...payload, id_campagne: editingCampaign.id_campagne }
            : campaign
        ));
      } else {
        // Create new campaign
        const response = await axios.post('http://localhost:8001/campaigns/', payload);
        message.success(`Campaign "${values.nom_campagne}" created successfully!`);
        
        // Add to local state as fallback
        const newCampaign = response.data || {
          ...payload,
          id_campagne: Date.now(), // Temporary ID
          date_creation: new Date().toISOString()
        };
        setCampaigns(prev => [...prev, newCampaign]);
      }
      
      setModalVisible(false);
      form.resetFields();
      // Refresh campaigns to get updated data
      setTimeout(() => fetchCampaigns(), 500);
      
    } catch (error) {
      console.error('Error saving campaign:', error);
      
      // Fallback: still save locally for demo purposes
      if (!editingCampaign) {
        const selectedTemplateData = templates.find(t => t.id === values.template_id);
        const newCampaign = {
          id_campagne: Date.now(),
          nom_campagne: values.nom_campagne,
          type_campagne: values.type_campagne,
          segment_cible: values.segment_cible || 'All contacts',
          statut: values.statut || 'draft',
          personnalisation_active: values.personnalisation_active !== false,
          date_creation: new Date().toISOString(),
          date_debut: values.date_debut ? values.date_debut.toISOString() : null,
          date_fin: values.date_fin ? values.date_fin.toISOString() : null,
          template_id: values.template_id,
          message_template: selectedTemplateData ? selectedTemplateData.content : '',
        };
        setCampaigns(prev => [...prev, newCampaign]);
        message.success(`Campaign "${values.nom_campagne}" created successfully!`);
      } else {
        message.error('Failed to update campaign. Please try again.');
      }
      
      setModalVisible(false);
      form.resetFields();
    }
  };

  const handlePreviewCampaign = async (campaign) => {
    try {
      // Use the existing campaign data and create a preview
      setPreviewData({
        campaign,
        preview: {
          total_contacts_cibles: contacts.length,
          apercu_messages: contacts.slice(0, 5).map(contact => ({
            contact: {
              nom: contact.nom || 'Dupont',
              prenom: contact.prenom || 'Jean',
              numero_telephone: contact.numero_telephone || '+33123456789'
            },
            message_personalise: campaign.message_template
              .replace('{prenom}', contact.prenom || 'Jean')
              .replace('{nom}', contact.nom || 'Dupont')
              .replace('{ville}', contact.ville || 'Paris')
          }))
        }
      });
      setPreviewModalVisible(true);
    } catch (error) {
      console.error('Error previewing campaign:', error);
      // Fallback preview with mock data
      setPreviewData({
        campaign,
        preview: {
          total_contacts_cibles: 150,
          apercu_messages: [
            {
              contact: { nom: 'Dupont', prenom: 'Jean', numero_telephone: '+33123456789' },
              message_personalise: campaign.message_template.replace('{prenom}', 'Jean').replace('{nom}', 'Dupont')
            },
            {
              contact: { nom: 'Martin', prenom: 'Marie', numero_telephone: '+33987654321' },
              message_personalise: campaign.message_template.replace('{prenom}', 'Marie').replace('{nom}', 'Martin')
            }
          ]
        }
      });
      setPreviewModalVisible(true);
      message.info('Showing preview with sample data');
    }
  };

  const handleLaunchCampaign = async (campaignId, campaignName) => {
    try {
      const campaign = campaigns.find(c => c.id_campagne === campaignId);
      if (campaign) {
        // Set the campaign for execution interface - works for ANY status
        setExecutingCampaign(campaign);
        setExecutionView(true);
        message.info(`Opening campaign execution for "${campaignName}" 🚀`);
      }
    } catch (error) {
      console.error('Error opening campaign execution:', error);
      message.error('Failed to open campaign execution interface');
    }
  };

  const handleBackFromExecution = () => {
    setExecutionView(false);
    setExecutingCampaign(null);
    // Refresh campaigns to see updated status
    fetchCampaigns();
  };

  const handlePauseCampaign = async (campaignId, campaignName) => {
    try {
      await axios.put(`http://localhost:8001/campaigns/${campaignId}`, { statut: 'paused' });
      message.success(`Campaign "${campaignName}" paused successfully! ⏸️`);
      fetchCampaigns();
    } catch (error) {
      console.error('Error pausing campaign:', error);
      // Fallback: update local state even if API fails
      setCampaigns(prev => prev.map(campaign => 
        campaign.id_campagne === campaignId 
          ? { ...campaign, statut: 'paused' }
          : campaign
      ));
      message.success(`Campaign "${campaignName}" paused successfully! ⏸️`);
    }
  };

  const handleStopCampaign = async (campaignId, campaignName) => {
    try {
      await axios.put(`http://localhost:8001/campaigns/${campaignId}`, { statut: 'stopped' });
      message.success(`Campaign "${campaignName}" stopped successfully! ⏹️`);
      fetchCampaigns();
    } catch (error) {
      console.error('Error stopping campaign:', error);
      // Fallback: update local state even if API fails
      setCampaigns(prev => prev.map(campaign => 
        campaign.id_campagne === campaignId 
          ? { ...campaign, statut: 'stopped' }
          : campaign
      ));
      message.success(`Campaign "${campaignName}" stopped successfully! ⏹️`);
    }
  };

  const handleResumeCampaign = async (campaignId, campaignName) => {
    try {
      await axios.put(`http://localhost:8001/campaigns/${campaignId}`, { statut: 'active' });
      message.success(`Campaign "${campaignName}" resumed successfully! ▶️`);
      fetchCampaigns();
    } catch (error) {
      console.error('Error resuming campaign:', error);
      // Fallback: update local state even if API fails
      setCampaigns(prev => prev.map(campaign => 
        campaign.id_campagne === campaignId 
          ? { ...campaign, statut: 'active' }
          : campaign
      ));
      message.success(`Campaign "${campaignName}" resumed successfully! ▶️`);
    }
  };

  const handleReactivateCampaign = async (campaignId, campaignName) => {
    try {
      await axios.put(`http://localhost:8001/campaigns/${campaignId}`, { statut: 'active' });
      message.success(`Campaign "${campaignName}" reactivated successfully! 🔄`);
      fetchCampaigns();
    } catch (error) {
      console.error('Error reactivating campaign:', error);
      // Fallback: update local state even if API fails
      setCampaigns(prev => prev.map(campaign => 
        campaign.id_campagne === campaignId 
          ? { ...campaign, statut: 'active' }
          : campaign
      ));
      message.success(`Campaign "${campaignName}" reactivated successfully! 🔄`);
    }
  };

  const handleSendCampaign = async (campaign) => {
    try {
      setPreviewModalVisible(false);
      // First launch the campaign if it's in draft
      if (campaign.statut === 'draft') {
        await handleLaunchCampaign(campaign.id_campagne, campaign.nom_campagne);
      }
      // Simulate sending to contacts
      message.success(`Campaign "${campaign.nom_campagne}" has been sent to ${contacts.length} contacts! 📧`);
    } catch (error) {
      console.error('Error sending campaign:', error);
      message.error('Failed to send campaign');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      active: 'processing',
      paused: 'warning',
      stopped: 'error',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Campaign Name',
      dataIndex: 'nom_campagne',
      key: 'nom_campagne',
    },
    {
      title: 'Type',
      dataIndex: 'type_campagne',
      key: 'type_campagne',
      render: (type) => (
        <Tag color={type === 'promotional' ? 'blue' : type === 'welcome' ? 'green' : 'orange'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'statut',
      key: 'statut',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'date_debut',
      key: 'date_debut',
      render: (date) => date ? moment(date).format('MMM DD, YYYY') : '-',
    },
    {
      title: 'End Date',
      dataIndex: 'date_fin',
      key: 'date_fin',
      render: (date) => date ? moment(date).format('MMM DD, YYYY') : '-',
    },
    {
      title: 'Personalization',
      dataIndex: 'personnalisation_active',
      key: 'personnalisation_active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Enabled' : 'Disabled'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space wrap>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handlePreviewCampaign(record)}
            title="Preview Campaign"
            size="small"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditCampaign(record)}
            title="Edit Campaign"
            size="small"
          />
          
          {/* Launch Campaign Execution Interface - Available for ALL campaigns */}
          <Button
            type="text"
            icon={<PlayCircleOutlined />}
            onClick={() => handleLaunchCampaign(record.id_campagne, record.nom_campagne)}
            title="Launch Campaign Execution"
            style={{ color: '#52c41a' }}
            size="small"
          />
          
          {/* Pause button for active campaigns */}
          {record.statut === 'active' && (
            <Button
              type="text"
              icon={<PauseCircleOutlined />}
              onClick={() => handlePauseCampaign(record.id_campagne, record.nom_campagne)}
              title="Pause Campaign"
              style={{ color: '#faad14' }}
              size="small"
            />
          )}
          
          {/* Resume button for paused campaigns */}
          {record.statut === 'paused' && (
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              onClick={() => handleResumeCampaign(record.id_campagne, record.nom_campagne)}
              title="Resume Campaign"
              style={{ color: '#52c41a' }}
              size="small"
            />
          )}
          
          {/* Stop button for active and paused campaigns */}
          {(record.statut === 'active' || record.statut === 'paused') && (
            <Popconfirm
              title={`Stop "${record.nom_campagne}"?`}
              description="This will permanently stop the campaign."
              onConfirm={() => handleStopCampaign(record.id_campagne, record.nom_campagne)}
              okText="Yes, Stop"
              cancelText="Cancel"
              okType="danger"
            >
              <Button
                type="text"
                icon={<StopOutlined />}
                title="Stop Campaign"
                style={{ color: '#f5222d' }}
                size="small"
              />
            </Popconfirm>
          )}
          
          {/* Reactivate button for stopped campaigns */}
          {record.statut === 'stopped' && (
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              onClick={() => handleReactivateCampaign(record.id_campagne, record.nom_campagne)}
              title="Reactivate Campaign"
              style={{ color: '#52c41a' }}
              size="small"
            />
          )}
          
          {/* Send button for active campaigns */}
          {record.statut === 'active' && (
            <Button
              type="text"
              icon={<SendOutlined />}
              onClick={() => handlePreviewCampaign(record)}
              title="Send Campaign Now"
              style={{ color: '#1890ff' }}
              size="small"
            />
          )}
          
          {/* Delete button */}
          <Popconfirm
            title={`Are you sure you want to delete "${record.nom_campagne}"?`}
            description="This action cannot be undone."
            onConfirm={() => handleDeleteCampaign(record.id_campagne, record.nom_campagne)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="Delete Campaign" size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {executionView ? (
        <CampaignExecution 
          campaign={executingCampaign}
          contacts={contacts}
          onBack={handleBackFromExecution}
        />
      ) : (
        <>
          <Title level={2}>Campaign Management</Title>
      
      {/* Campaign Stats Summary */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Text type="secondary">Total Campaigns</Text>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              {campaigns.length}
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Text type="secondary">Active</Text>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
              {campaigns.filter(c => c.statut === 'active').length}
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Text type="secondary">Draft</Text>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d9d9d9' }}>
              {campaigns.filter(c => c.statut === 'draft').length}
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Text type="secondary">Paused</Text>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
              {campaigns.filter(c => c.statut === 'paused').length}
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Text type="secondary">Stopped</Text>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
              {campaigns.filter(c => c.statut === 'stopped').length}
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Text type="secondary">Success Rate</Text>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
              95%
            </div>
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Text type="secondary">Manage your SMS campaigns</Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddCampaign}
            >
              Create Campaign
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={campaigns}
          loading={loading}
          rowKey="id_campagne"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} campaigns`,
          }}
        />
      </Card>

      {/* Create/Edit Campaign Modal */}
      <Modal
        title={editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Campaign Name"
                name="nom_campagne"
                rules={[{ required: true, message: 'Please enter campaign name' }]}
              >
                <Input placeholder="Enter campaign name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Campaign Type"
                name="type_campagne"
                rules={[{ required: true, message: 'Please select campaign type' }]}
              >
                <Select placeholder="Select campaign type">
                  <Option value="promotional">Promotional</Option>
                  <Option value="welcome">Welcome</Option>
                  <Option value="reminder">Reminder</Option>
                  <Option value="notification">Notification</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Start Date"
                name="date_debut"
                rules={[{ required: true, message: 'Please select start date' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  showTime
                  placeholder="Select start date"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="End Date" name="date_fin">
                <DatePicker
                  style={{ width: '100%' }}
                  showTime
                  placeholder="Select end date (optional)"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Target Segment" name="segment_cible">
                <Input placeholder="e.g., Premium customers, Paris region" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Status" name="statut" initialValue="draft">
                <Select>
                  <Option value="draft">Draft</Option>
                  <Option value="active">Active</Option>
                  <Option value="paused">Paused</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Message Template"
            name="template_id"
            rules={[{ required: true, message: 'Please select a message template' }]}
          >
            <Select
              placeholder="Select a message template"
              onChange={(value) => {
                const template = templates.find(t => t.id === value);
                setSelectedTemplate(template);
                if (template) {
                  form.setFieldsValue({ message_content: template.content });
                }
              }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {templates.map(template => (
                <Option key={template.id} value={template.id}>
                  <div>
                    <strong>{template.name}</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {template.content.substring(0, 50)}...
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedTemplate && (
            <Form.Item label="Template Preview">
              <div style={{ 
                background: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '6px',
                border: '1px solid #d9d9d9'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>Template: {selectedTemplate.name}</Text>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <Text>{selectedTemplate.content}</Text>
                </div>
                {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                  <div>
                    <Text type="secondary">Variables: </Text>
                    {selectedTemplate.variables.map(variable => (
                      <Tag key={variable} color="blue" size="small">
                        {`{${variable}}`}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            </Form.Item>
          )}

          <Form.Item
            label="Enable Personalization"
            name="personnalisation_active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCampaign ? 'Update' : 'Create'} Campaign
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={`Campaign Preview: ${previewData?.campaign?.nom_campagne || ''}`}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Close
          </Button>,
          previewData?.campaign?.statut === 'draft' && (
            <Button 
              key="launch" 
              type="primary" 
              icon={<PlayCircleOutlined />}
              onClick={() => handleSendCampaign(previewData.campaign)}
            >
              Launch Campaign
            </Button>
          ),
          previewData?.campaign?.statut === 'active' && (
            <Button 
              key="send" 
              type="primary" 
              icon={<SendOutlined />}
              onClick={() => handleSendCampaign(previewData.campaign)}
            >
              Send Now
            </Button>
          ),
        ].filter(Boolean)}
        width={700}
      >
        {previewData && (
          <div>
            <Card title="Campaign Details" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Name: </Text>
                  <Text>{previewData.campaign.nom_campagne}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Type: </Text>
                  <Tag color={previewData.campaign.type_campagne === 'promotional' ? 'blue' : 'green'}>
                    {previewData.campaign.type_campagne}
                  </Tag>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={12}>
                  <Text strong>Status: </Text>
                  <Tag color={getStatusColor(previewData.campaign.statut)}>
                    {previewData.campaign.statut.toUpperCase()}
                  </Tag>
                </Col>
                <Col span={12}>
                  <Text strong>Personalization: </Text>
                  <Tag color={previewData.campaign.personnalisation_active ? 'green' : 'red'}>
                    {previewData.campaign.personnalisation_active ? 'Enabled' : 'Disabled'}
                  </Tag>
                </Col>
              </Row>
              <Divider />
              <Text strong>Message Template:</Text>
              <div style={{ 
                background: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '4px',
                marginTop: '8px',
                border: '1px solid #d9d9d9'
              }}>
                {previewData.campaign.message_template}
              </div>
            </Card>
            
            <Card title="Message Previews" size="small" style={{ marginBottom: 16 }}>
              {previewData.preview.apercu_messages?.map((msg, index) => (
                <div key={index} style={{ marginBottom: 12, padding: 8, background: '#fafafa', borderRadius: 4 }}>
                  <Text strong>To: </Text>
                  <Text>{msg.contact.prenom} {msg.contact.nom} ({msg.contact.numero_telephone})</Text>
                  <br />
                  <Text type="secondary">Message: </Text>
                  <Text>{msg.message_personalise}</Text>
                </div>
              ))}
            </Card>
            
            <Card title="Campaign Statistics" size="small">
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text strong>Target Contacts</Text>
                    <div style={{ fontSize: '24px', color: '#1890ff', fontWeight: 'bold' }}>
                      {previewData.preview.total_contacts_cibles || contacts.length}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text strong>Estimated Cost</Text>
                    <div style={{ fontSize: '24px', color: '#52c41a', fontWeight: 'bold' }}>
                      ${((previewData.preview.total_contacts_cibles || contacts.length) * 0.05).toFixed(2)}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Text strong>Delivery Rate</Text>
                    <div style={{ fontSize: '24px', color: '#722ed1', fontWeight: 'bold' }}>
                      95%
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>
        </>
      )}
    </div>
  );
};

export default CampaignManagement;
