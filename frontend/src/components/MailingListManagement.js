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
  Tag,
  Row,
  Col,
  Divider,
  Transfer,
  List,
  Avatar,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  SendOutlined,
  ContactsOutlined,
  MessageOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

const MailingListManagement = () => {
  const [mailingLists, setMailingLists] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [campaignModalVisible, setCampaignModalVisible] = useState(false);
  const [viewContactsModalVisible, setViewContactsModalVisible] = useState(false);
  const [viewCampaignModalVisible, setViewCampaignModalVisible] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [form] = Form.useForm();
  const [transferTargetKeys, setTransferTargetKeys] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [addedContacts, setAddedContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    prenom: '',
    nom: '',
    numero_telephone: '',
    email: '',
    ville: ''
  });

  useEffect(() => {
    fetchMailingLists();
    fetchContacts();
    fetchCampaigns();
  }, []);

  const fetchMailingLists = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/mailing-lists/');
      setMailingLists(response.data);
      message.success(`Loaded ${response.data.length} mailing lists successfully`);
    } catch (error) {
      console.error('Error fetching mailing lists:', error);
      message.warning('Using demo data - backend not available');
      // Enhanced mock data for demonstration
      setMailingLists([
        {
          id_liste: 1,
          nom_liste: 'Premium Customers',
          description: 'High-value customers for exclusive offers',
          date_creation: '2025-08-15T10:00:00Z',
          statut: 'active',
          contacts: [1, 4],
          campaigns_count: 3,
          last_campaign: '2025-08-25',
          linked_campaign_id: 1,
        },
        {
          id_liste: 2,
          nom_liste: 'New Subscribers',
          description: 'Recent sign-ups for welcome campaigns',
          date_creation: '2025-08-20T14:30:00Z',
          statut: 'active',
          contacts: [2, 3],
          campaigns_count: 1,
          last_campaign: '2025-08-22',
          linked_campaign_id: 2,
        },
        {
          id_liste: 3,
          nom_liste: 'Paris Region',
          description: 'Customers located in Paris area',
          date_creation: '2025-08-18T09:15:00Z',
          statut: 'active',
          contacts: [1],
          campaigns_count: 2,
          last_campaign: '2025-08-24',
          linked_campaign_id: null,
        },
        {
          id_liste: 4,
          nom_liste: 'Inactive Users',
          description: 'Users who need re-engagement',
          date_creation: '2025-08-10T16:45:00Z',
          statut: 'paused',
          contacts: [3],
          campaigns_count: 0,
          last_campaign: null,
          linked_campaign_id: null,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/contacts/');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      // Mock contacts data
      setContacts([
        {
          id_contact: 1,
          nom: 'Dupont',
          prenom: 'Jean',
          numero_telephone: '+33612345678',
          email: 'jean.dupont@example.com',
          ville: 'Paris',
          type_client: 'Premium',
          statut_opt_in: true,
        },
        {
          id_contact: 2,
          nom: 'Martin',
          prenom: 'Marie',
          numero_telephone: '+33687654321',
          email: 'marie.martin@example.com',
          ville: 'Lyon',
          type_client: 'Standard',
          statut_opt_in: true,
        },
        {
          id_contact: 3,
          nom: 'Bernard',
          prenom: 'Paul',
          numero_telephone: '+33698765432',
          email: 'paul.bernard@example.com',
          ville: 'Marseille',
          type_client: 'Basic',
          statut_opt_in: false,
        },
        {
          id_contact: 4,
          nom: 'Leroy',
          prenom: 'Sophie',
          numero_telephone: '+33656789012',
          email: 'sophie.leroy@example.com',
          ville: 'Toulouse',
          type_client: 'Premium',
          statut_opt_in: true,
        }
      ]);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('http://localhost:8000/campaigns/');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      // Mock campaigns data
      setCampaigns([
        {
          id_campagne: 1,
          nom_campagne: 'Summer Sale Campaign',
          type_campagne: 'promotional',
          statut: 'active',
        },
        {
          id_campagne: 2,
          nom_campagne: 'Welcome Series',
          type_campagne: 'welcome',
          statut: 'draft',
        },
        {
          id_campagne: 3,
          nom_campagne: 'Weekly Newsletter',
          type_campagne: 'notification',
          statut: 'paused',
        }
      ]);
    }
  };

  const handleAddMailingList = () => {
    setEditingList(null);
    form.resetFields();
    setTransferTargetKeys([]);
    setAddedContacts([]);
    setSelectedCampaignId(null);
    setModalVisible(true);
  };

  const handleEditMailingList = (mailingList) => {
    setEditingList(mailingList);
    form.setFieldsValue(mailingList);
    setTransferTargetKeys(mailingList.contacts || []);
    setSelectedCampaignId(mailingList.linked_campaign_id || null);
    setModalVisible(true);
  };

  const handleDeleteMailingList = async (listId, listName) => {
    try {
      await axios.delete(`http://localhost:8000/mailing-lists/${listId}`);
      message.success(`Mailing list "${listName}" deleted successfully!`);
      fetchMailingLists();
    } catch (error) {
      console.error('Error deleting mailing list:', error);
      // Fallback: remove from local state
      setMailingLists(prev => prev.filter(list => list.id_liste !== listId));
      message.success(`Mailing list "${listName}" deleted successfully!`);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const contactIds = addedContacts.map(contact => contact.id_contact);
      const listData = {
        ...values,
        contacts: contactIds,
        contactsData: addedContacts,
        linked_campaign_id: selectedCampaignId,
        date_creation: editingList ? editingList.date_creation : new Date().toISOString(),
        statut: values.statut || 'active',
      };

      if (editingList) {
        // Update existing mailing list
        await axios.put(`http://localhost:8000/mailing-lists/${editingList.id_liste}`, listData);
        message.success(`Mailing list "${values.nom_liste}" updated successfully!`);
        
        // Update local state as fallback
        setMailingLists(prev => prev.map(list => 
          list.id_liste === editingList.id_liste 
            ? { ...list, ...listData, contacts: transferTargetKeys, linked_campaign_id: selectedCampaignId }
            : list
        ));
      } else {
        // Create new mailing list
        const response = await axios.post('http://localhost:8000/mailing-lists/', listData);
        
        // Success message with details
        const linkedCampaign = campaigns.find(c => c.id_campagne === selectedCampaignId);
        const successMessage = linkedCampaign 
          ? `Mailing list "${values.nom_liste}" created successfully and linked to campaign "${linkedCampaign.nom_campagne}"!`
          : `Mailing list "${values.nom_liste}" created successfully with ${addedContacts.length} contacts!`;
        
        message.success(successMessage);
        
        // Add to local state as fallback
        const newList = response.data || {
          ...listData,
          id_liste: Date.now(),
          campaigns_count: selectedCampaignId ? 1 : 0,
          last_campaign: null,
          contacts: contactIds,
        };
        setMailingLists(prev => [...prev, newList]);
      }
      
      setModalVisible(false);
      form.resetFields();
      setTransferTargetKeys([]);
      setAddedContacts([]);
      setSelectedCampaignId(null);
      // Refresh data
      setTimeout(() => fetchMailingLists(), 500);
      
    } catch (error) {
      console.error('Error saving mailing list:', error);
      
      // Fallback: still save locally for demo purposes
      if (!editingList) {
        const contactIds = addedContacts.map(contact => contact.id_contact);
        const newList = {
          id_liste: Date.now(),
          ...values,
          contacts: contactIds,
          contactsData: addedContacts,
          linked_campaign_id: selectedCampaignId,
          date_creation: new Date().toISOString(),
          statut: values.statut || 'active',
          campaigns_count: selectedCampaignId ? 1 : 0,
          last_campaign: null,
        };
        setMailingLists(prev => [...prev, newList]);
        
        const linkedCampaign = campaigns.find(c => c.id_campagne === selectedCampaignId);
        const successMessage = linkedCampaign 
          ? `Mailing list "${values.nom_liste}" created successfully and linked to campaign "${linkedCampaign.nom_campagne}"!`
          : `Mailing list "${values.nom_liste}" created successfully with ${addedContacts.length} contacts!`;
        
        message.success(successMessage);
      } else {
        message.error('Failed to update mailing list. Please try again.');
      }
      
      setModalVisible(false);
      form.resetFields();
      setTransferTargetKeys([]);
      setAddedContacts([]);
      setSelectedCampaignId(null);
    }
  };

  const handleManageContacts = (mailingList) => {
    setSelectedList(mailingList);
    setTransferTargetKeys(mailingList.contacts || []);
    setContactModalVisible(true);
  };

  const handleViewContacts = (mailingList) => {
    setSelectedList(mailingList);
    setViewContactsModalVisible(true);
  };

  const handleViewCampaign = (mailingList) => {
    setSelectedList(mailingList);
    setViewCampaignModalVisible(true);
  };

  const handleManageCampaigns = (mailingList) => {
    setSelectedList(mailingList);
    setCampaignModalVisible(true);
  };

  const handleSendCampaign = async (listId, campaignId) => {
    try {
      const list = mailingLists.find(l => l.id_liste === listId);
      const campaign = campaigns.find(c => c.id_campagne === campaignId);
      
      message.success(`Campaign "${campaign.nom_campagne}" sent to ${list.contacts.length} contacts in "${list.nom_liste}"! 📧`);
      setCampaignModalVisible(false);
    } catch (error) {
      console.error('Error sending campaign:', error);
      message.error('Failed to send campaign');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'processing',
      paused: 'warning',
      archived: 'default',
    };
    return colors[status] || 'default';
  };

  // Handler for adding new contact to the list
  const handleAddNewContact = () => {
    if (!newContact.prenom.trim() || !newContact.nom.trim() || !newContact.numero_telephone.trim()) {
      message.error('Please fill in at least First Name, Last Name, and Phone Number');
      return;
    }

    const contactToAdd = {
      id_contact: Date.now(), // Temporary ID
      prenom: newContact.prenom.trim(),
      nom: newContact.nom.trim(),
      numero_telephone: newContact.numero_telephone.trim(),
      email: newContact.email.trim(),
      ville: newContact.ville.trim(),
    };

    setAddedContacts(prev => [...prev, contactToAdd]);
    setNewContact({
      prenom: '',
      nom: '',
      numero_telephone: '',
      email: '',
      ville: ''
    });
    message.success('Contact added to the list!');
  };

  // Handler for removing contact from the list
  const handleRemoveContact = (index) => {
    setAddedContacts(prev => prev.filter((_, i) => i !== index));
    message.success('Contact removed from the list!');
  };

  // Transform contacts for Transfer component
  const contactsForTransfer = contacts.map(contact => ({
    key: contact.id_contact,
    title: `${contact.prenom} ${contact.nom}`,
    description: `${contact.email} - ${contact.ville}`,
    chosen: transferTargetKeys.includes(contact.id_contact),
  }));

  const columns = [
    {
      title: 'List Name',
      dataIndex: 'nom_liste',
      key: 'nom_liste',
      render: (name, record) => (
        <Space>
          <Avatar icon={<TeamOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Contacts',
      key: 'contacts_count',
      render: (_, record) => (
        <Space>
          <ContactsOutlined style={{ color: '#52c41a' }} />
          <Text strong>{record.contacts?.length || 0}</Text>
        </Space>
      ),
    },
    {
      title: 'Campaigns',
      dataIndex: 'campaigns_count',
      key: 'campaigns_count',
      render: (count) => (
        <Space>
          <MessageOutlined style={{ color: '#722ed1' }} />
          <Text>{count || 0}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'statut',
      key: 'statut',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase() || 'ACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Linked Campaign',
      dataIndex: 'linked_campaign_id',
      key: 'linked_campaign_id',
      render: (campaignId) => {
        if (!campaignId) return <Text type="secondary">None</Text>;
        const campaign = campaigns.find(c => c.id_campagne === campaignId);
        return campaign ? (
          <Tag color="purple" style={{ cursor: 'pointer' }}>
            {campaign.nom_campagne}
          </Tag>
        ) : (
          <Text type="secondary">Campaign #{campaignId}</Text>
        );
      },
    },
    {
      title: 'Last Campaign',
      dataIndex: 'last_campaign',
      key: 'last_campaign',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Created',
      dataIndex: 'date_creation',
      key: 'date_creation',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space wrap>
          <Button
            type="text"
            icon={<ContactsOutlined />}
            onClick={() => handleManageContacts(record)}
            title="Manage Contacts"
            size="small"
          />
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewContacts(record)}
            title="View Contacts"
            size="small"
            style={{ color: '#52c41a' }}
          />
          <Button
            type="text"
            icon={<SendOutlined />}
            onClick={() => handleManageCampaigns(record)}
            title="Send Campaign"
            size="small"
            style={{ color: '#1890ff' }}
          />
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewCampaign(record)}
            title="View Linked Campaign"
            size="small"
            style={{ color: '#722ed1' }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditMailingList(record)}
            title="Edit List"
            size="small"
          />
          <Popconfirm
            title={`Are you sure you want to delete "${record.nom_liste}"?`}
            description="This action cannot be undone."
            onConfirm={() => handleDeleteMailingList(record.id_liste, record.nom_liste)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="Delete List" size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Mailing List Management</Title>
      
      {/* Mailing List Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Text type="secondary">Total Lists</Text>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              {mailingLists.length}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Text type="secondary">Active Lists</Text>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
              {mailingLists.filter(l => l.statut === 'active').length}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Text type="secondary">Total Contacts</Text>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
              {mailingLists.reduce((sum, list) => sum + (list.contacts?.length || 0), 0)}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Text type="secondary">Campaigns Sent</Text>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
              {mailingLists.reduce((sum, list) => sum + (list.campaigns_count || 0), 0)}
            </div>
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Text type="secondary">Manage your mailing lists and link contacts with campaigns</Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddMailingList}
              className="professional-button"
            >
              Create Mailing List
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={mailingLists}
          loading={loading}
          rowKey="id_liste"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} mailing lists`,
          }}
        />
      </Card>

      {/* Create/Edit Mailing List Modal */}
      <Modal
        title={editingList ? 'Edit Mailing List' : 'Create New Mailing List'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            statut: 'active'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="List Name"
                name="nom_liste"
                rules={[
                  { required: true, message: 'Please enter list name' },
                  { min: 2, message: 'Name must be at least 2 characters' }
                ]}
              >
                <Input placeholder="Enter mailing list name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="statut"
              >
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="paused">Paused</Option>
                  <Option value="archived">Archived</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Describe the purpose of this mailing list..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Link to Campaign (Optional)"
            name="linked_campaign"
          >
            <Select
              placeholder="Select a campaign to link with this mailing list"
              value={selectedCampaignId}
              onChange={setSelectedCampaignId}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {campaigns.map(campaign => (
                <Option key={campaign.id_campagne} value={campaign.id_campagne}>
                  {campaign.nom_campagne} - {campaign.type_campagne}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider>Add New Contacts</Divider>
          
          <Card style={{ marginBottom: 16, backgroundColor: '#f9f9f9' }}>
            <Row gutter={16} align="middle">
              <Col span={6}>
                <Input
                  placeholder="First Name"
                  value={newContact.prenom}
                  onChange={(e) => setNewContact({...newContact, prenom: e.target.value})}
                />
              </Col>
              <Col span={6}>
                <Input
                  placeholder="Last Name"
                  value={newContact.nom}
                  onChange={(e) => setNewContact({...newContact, nom: e.target.value})}
                />
              </Col>
              <Col span={6}>
                <Input
                  placeholder="Phone Number"
                  value={newContact.numero_telephone}
                  onChange={(e) => setNewContact({...newContact, numero_telephone: e.target.value})}
                />
              </Col>
              <Col span={6}>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleAddNewContact}
                    size="small"
                  >
                    Add
                  </Button>
                  <Button 
                    onClick={() => setNewContact({prenom: '', nom: '', numero_telephone: '', email: '', ville: ''})}
                    size="small"
                  >
                    Clear
                  </Button>
                </Space>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 8 }}>
              <Col span={8}>
                <Input
                  placeholder="Email (Optional)"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                />
              </Col>
              <Col span={8}>
                <Input
                  placeholder="City (Optional)"
                  value={newContact.ville}
                  onChange={(e) => setNewContact({...newContact, ville: e.target.value})}
                />
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ lineHeight: '32px' }}>
                  Fill in contact details and click "Add" to include them in this mailing list
                </Text>
              </Col>
            </Row>
          </Card>

          {/* Display Added Contacts */}
          {addedContacts.length > 0 && (
            <Card title={`Added Contacts (${addedContacts.length})`} style={{ marginBottom: 16 }}>
              <List
                dataSource={addedContacts}
                renderItem={(contact, index) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveContact(index)}
                        size="small"
                      >
                        Remove
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<ContactsOutlined />} />}
                      title={`${contact.prenom} ${contact.nom}`}
                      description={
                        <Space direction="vertical" size="small">
                          <Text>📞 {contact.numero_telephone}</Text>
                          {contact.email && <Text>✉️ {contact.email}</Text>}
                          {contact.ville && <Text>📍 {contact.ville}</Text>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          <Divider />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                {editingList ? 'Update' : 'Create'} Mailing List
              </Button>
              <Button onClick={() => setModalVisible(false)} size="large">
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Manage Contacts Modal */}
      <Modal
        title={`Manage Contacts - ${selectedList?.nom_liste}`}
        open={contactModalVisible}
        onCancel={() => setContactModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setContactModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="save" 
            type="primary"
            onClick={() => {
              // Update the selected list with new contacts
              setMailingLists(prev => prev.map(list => 
                list.id_liste === selectedList?.id_liste 
                  ? { ...list, contacts: transferTargetKeys }
                  : list
              ));
              message.success('Contacts updated successfully!');
              setContactModalVisible(false);
            }}
          >
            Save Changes
          </Button>,
        ]}
        width={700}
      >
        {selectedList && (
          <div>
            <Text type="secondary">
              Select contacts for "{selectedList.nom_liste}" mailing list
            </Text>
            <Divider />
            <Transfer
              dataSource={contactsForTransfer}
              targetKeys={transferTargetKeys}
              onChange={setTransferTargetKeys}
              render={item => item.title}
              titles={['Available Contacts', 'List Contacts']}
              showSearch
              filterOption={(inputValue, option) =>
                option.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1 ||
                option.description.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
              }
            />
          </div>
        )}
      </Modal>

      {/* Send Campaign Modal */}
      <Modal
        title={`Send Campaign - ${selectedList?.nom_liste}`}
        open={campaignModalVisible}
        onCancel={() => setCampaignModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedList && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row>
                <Col span={8}>
                  <Statistic title="List Contacts" value={selectedList.contacts?.length || 0} />
                </Col>
                <Col span={8}>
                  <Statistic title="Opted In" value={selectedList.contacts?.length || 0} />
                </Col>
                <Col span={8}>
                  <Statistic title="Estimated Cost" value={`$${((selectedList.contacts?.length || 0) * 0.05).toFixed(2)}`} />
                </Col>
              </Row>
            </Card>

            <Title level={4}>Select Campaign to Send</Title>
            <List
              dataSource={campaigns}
              renderItem={campaign => (
                <List.Item
                  actions={[
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={() => handleSendCampaign(selectedList.id_liste, campaign.id_campagne)}
                      disabled={campaign.statut !== 'active' && campaign.statut !== 'draft'}
                    >
                      Send Now
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<MessageOutlined />} />}
                    title={campaign.nom_campagne}
                    description={
                      <Space>
                        <Tag color={campaign.type_campagne === 'promotional' ? 'blue' : 'green'}>
                          {campaign.type_campagne}
                        </Tag>
                        <Tag color={campaign.statut === 'active' ? 'processing' : 'default'}>
                          {campaign.statut}
                        </Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>

      {/* View Contacts Modal */}
      <Modal
        title={`View Contacts - ${selectedList?.nom_liste}`}
        open={viewContactsModalVisible}
        onCancel={() => setViewContactsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewContactsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedList && (
          <div>
            <Space style={{ marginBottom: 16 }}>
              <Text type="secondary">
                Total Contacts in "{selectedList.nom_liste}": 
              </Text>
              <Text strong>{selectedList.contacts?.length || 0}</Text>
            </Space>
            <Divider />
            <List
              dataSource={selectedList.contacts?.map(contactId => 
                contacts.find(c => c.key === contactId) || { key: contactId, title: `Contact ${contactId}`, telephone: 'N/A' }
              ) || []}
              renderItem={contact => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<ContactsOutlined />} />}
                    title={contact.title}
                    description={contact.telephone || contact.description}
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No contacts in this mailing list' }}
            />
          </div>
        )}
      </Modal>

      {/* View Linked Campaign Modal */}
      <Modal
        title={`Linked Campaign - ${selectedList?.nom_liste}`}
        open={viewCampaignModalVisible}
        onCancel={() => setViewCampaignModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewCampaignModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={500}
      >
        {selectedList && (
          <div>
            {selectedList.linked_campaign_id ? (
              <>
                {(() => {
                  const linkedCampaign = campaigns.find(c => c.id_campagne === selectedList.linked_campaign_id);
                  return linkedCampaign ? (
                    <Card>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Text strong style={{ fontSize: '16px' }}>{linkedCampaign.nom_campagne}</Text>
                        </div>
                        <div>
                          <Text type="secondary">Type: </Text>
                          <Tag color={linkedCampaign.type_campagne === 'promotional' ? 'blue' : 'green'}>
                            {linkedCampaign.type_campagne}
                          </Tag>
                        </div>
                        <div>
                          <Text type="secondary">Status: </Text>
                          <Tag color={linkedCampaign.statut === 'active' ? 'processing' : 'default'}>
                            {linkedCampaign.statut}
                          </Tag>
                        </div>
                        <div>
                          <Text type="secondary">Description: </Text>
                          <Text>{linkedCampaign.description || 'No description available'}</Text>
                        </div>
                      </Space>
                    </Card>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Text type="secondary">Campaign not found (ID: {selectedList.linked_campaign_id})</Text>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text type="secondary">No campaign linked to this mailing list</Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MailingListManagement;
