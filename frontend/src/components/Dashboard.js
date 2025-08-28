import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Badge, Progress, Typography, Button, Tag, Space, Alert, List, Avatar } from 'antd';
import {
  UserOutlined,
  MessageOutlined,
  SendOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalCampaigns: 0,
    totalMessages: 0,
    successRate: 0,
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard stats from API
      const response = await axios.get('http://localhost:8001/dashboard');
      setStats(response.data);
      
      // Fetch recent campaigns
      const campaignsResponse = await axios.get('http://localhost:8001/campaigns/');
      setRecentCampaigns(campaignsResponse.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set mock data for demonstration
      setStats({
        totalContacts: 1250,
        totalCampaigns: 45,
        totalMessages: 8750,
        successRate: 94.5,
      });
      setRecentCampaigns([
        {
          id_campagne: 1,
          nom_campagne: 'Summer Sale Campaign',
          statut: 'active',
          date_creation: '2025-08-20',
          type_campagne: 'promotional'
        },
        {
          id_campagne: 2,
          nom_campagne: 'Welcome Series',
          statut: 'completed',
          date_creation: '2025-08-18',
          type_campagne: 'welcome'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const campaignColumns = [
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
        <Badge 
          color={type === 'promotional' ? 'blue' : type === 'welcome' ? 'green' : 'orange'} 
          text={type} 
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'statut',
      key: 'statut',
      render: (status) => (
        <Badge 
          status={status === 'active' ? 'processing' : status === 'completed' ? 'success' : 'default'} 
          text={status} 
        />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'date_creation',
      key: 'date_creation',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Text type="secondary">Welcome to your SMS Campaign Platform</Text>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Contacts"
              value={stats.totalContacts}
              prefix={<UserOutlined />}
              suffix={
                <span style={{ fontSize: '12px', color: '#52c41a' }}>
                  <ArrowUpOutlined /> 12%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Campaigns"
              value={stats.totalCampaigns}
              prefix={<MessageOutlined />}
              suffix={
                <span style={{ fontSize: '12px', color: '#52c41a' }}>
                  <ArrowUpOutlined /> 8%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Messages Sent"
              value={stats.totalMessages}
              prefix={<SendOutlined />}
              suffix={
                <span style={{ fontSize: '12px', color: '#ff4d4f' }}>
                  <ArrowDownOutlined /> 3%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={stats.successRate}
              precision={1}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Recent Campaigns" extra={<Button type="link">View All</Button>}>
            <Table
              columns={campaignColumns}
              dataSource={recentCampaigns}
              pagination={false}
              loading={loading}
              rowKey="id_campagne"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Campaign Performance">
            <div style={{ marginBottom: 16 }}>
              <Text>Delivery Rate</Text>
              <Progress percent={96} status="active" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text>Open Rate</Text>
              <Progress percent={78} status="active" strokeColor="#52c41a" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text>Click Rate</Text>
              <Progress percent={45} status="active" strokeColor="#1890ff" />
            </div>
            <div>
              <Text>Conversion Rate</Text>
              <Progress percent={23} status="active" strokeColor="#722ed1" />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Quick Actions">
            <Row gutter={16}>
              <Col>
                <Button type="primary" icon={<MessageOutlined />}>
                  Create Campaign
                </Button>
              </Col>
              <Col>
                <Button icon={<UserOutlined />}>
                  Add Contacts
                </Button>
              </Col>
              <Col>
                <Button icon={<SendOutlined />}>
                  Send Message
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
