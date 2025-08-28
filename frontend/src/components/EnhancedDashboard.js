import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Badge, Progress, Typography, Button, Space, List, Avatar, message } from 'antd';
import {
  UserOutlined,
  MessageOutlined,
  SendOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats] = useState({
    totalContacts: 1247,
    totalCampaigns: 23,
    totalMessages: 15680,
    successRate: 94.5,
    activeUsers: 8,
    revenue: 4250.75,
    avgOpenRate: 68.2,
    avgClickRate: 15.8
  });

  // Real-time performance metrics
  const performanceData = [
    { name: 'Jan', sent: 4800, delivered: 4560, opened: 2280, clicked: 912, cost: 240 },
    { name: 'Feb', sent: 5200, delivered: 4940, opened: 2470, clicked: 988, cost: 260 },
    { name: 'Mar', sent: 6100, delivered: 5795, opened: 2898, clicked: 1159, cost: 305 },
    { name: 'Apr', sent: 5800, delivered: 5510, opened: 2755, clicked: 1102, cost: 290 },
    { name: 'May', sent: 7200, delivered: 6840, opened: 3420, clicked: 1368, cost: 360 },
    { name: 'Jun', sent: 8100, delivered: 7695, opened: 3848, clicked: 1539, cost: 405 },
  ];

  // Campaign type distribution
  const campaignTypes = [
    { name: 'Promotional', value: 45, color: '#8884d8' },
    { name: 'Welcome', value: 25, color: '#82ca9d' },
    { name: 'Reminder', value: 20, color: '#ffc658' },
    { name: 'Notification', value: 10, color: '#ff7c7c' },
  ];

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      action: 'Campaign "Summer Sale" completed successfully',
      user: 'John Manager',
      time: '2 minutes ago',
      type: 'success',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      details: '2,450 messages sent, 96.2% delivery rate'
    },
    {
      id: 2,
      action: 'New contact import completed',
      user: 'Sarah Admin',
      time: '15 minutes ago',
      type: 'info',
      icon: <UserOutlined style={{ color: '#1890ff' }} />,
      details: '150 new contacts added from CSV file'
    },
    {
      id: 3,
      action: 'Campaign "Weekend Deals" scheduled',
      user: 'Mike Marketer',
      time: '1 hour ago',
      type: 'warning',
      icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
      details: 'Scheduled for Saturday 9:00 AM, 1,200 recipients'
    },
    {
      id: 4,
      action: 'Monthly analytics report generated',
      user: 'System',
      time: '2 hours ago',
      type: 'info',
      icon: <BarChartOutlined style={{ color: '#722ed1' }} />,
      details: 'Report available in Analytics section'
    },
  ];

  const recentCampaigns = [
    {
      key: '1',
      name: 'Summer Sale 2025',
      status: 'completed',
      sent: 2450,
      delivered: 2357,
      opened: 1596,
      clicked: 318,
      cost: '$122.50',
      date: '2025-08-26'
    },
    {
      key: '2',
      name: 'New Product Launch',
      status: 'active',
      sent: 1800,
      delivered: 1728,
      opened: 864,
      clicked: 173,
      cost: '$90.00',
      date: '2025-08-25'
    },
    {
      key: '3',
      name: 'Welcome Series - Week 1',
      status: 'scheduled',
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      cost: '$0.00',
      date: '2025-08-28'
    }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from your API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock API data would be processed here
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const campaignColumns = [
    {
      title: 'Campaign',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.date}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          completed: 'success',
          active: 'processing',
          scheduled: 'warning',
          paused: 'default',
        };
        return <Badge status={colors[status]} text={status.toUpperCase()} />;
      },
    },
    {
      title: 'Sent',
      dataIndex: 'sent',
      key: 'sent',
      render: (value) => value.toLocaleString(),
    },
    {
      title: 'Delivered',
      dataIndex: 'delivered',
      key: 'delivered',
      render: (value, record) => (
        <div>
          <div>{value.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.sent > 0 ? `${((value / record.sent) * 100).toFixed(1)}%` : '0%'}
          </div>
        </div>
      ),
    },
    {
      title: 'Opened',
      dataIndex: 'opened',
      key: 'opened',
      render: (value, record) => (
        <div>
          <div>{value.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.delivered > 0 ? `${((value / record.delivered) * 100).toFixed(1)}%` : '0%'}
          </div>
        </div>
      ),
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost) => <Text strong>{cost}</Text>,
    },
  ];

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          📊 Dashboard Overview
        </Title>
        <Text type="secondary">
          Real-time insights and performance metrics for your SMS campaigns
        </Text>
      </div>

      {/* Key Performance Indicators */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Messages Sent"
              value={stats.totalMessages}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={
                <span style={{ fontSize: '14px', color: '#52c41a' }}>
                  <ArrowUpOutlined /> 12.5%
                </span>
              }
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              vs last month
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Contacts"
              value={stats.totalContacts}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <span style={{ fontSize: '14px', color: '#52c41a' }}>
                  <ArrowUpOutlined /> 8.2%
                </span>
              }
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              150 added this week
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={stats.successRate}
              precision={1}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
            <Progress 
              percent={stats.successRate} 
              size="small" 
              showInfo={false}
              style={{ marginTop: '8px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Revenue Generated"
              value={stats.revenue}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#722ed1' }}
              suffix={
                <span style={{ fontSize: '14px', color: '#52c41a' }}>
                  <ArrowUpOutlined /> 15.3%
                </span>
              }
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              from campaign conversions
            </div>
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Avg. Open Rate"
              value={stats.avgOpenRate}
              precision={1}
              suffix="%"
              valueStyle={{ fontSize: '20px', color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Avg. Click Rate"
              value={stats.avgClickRate}
              precision={1}
              suffix="%"
              valueStyle={{ fontSize: '20px', color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Active Users"
              value={stats.activeUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ fontSize: '20px', color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Campaigns"
              value={stats.totalCampaigns}
              prefix={<SendOutlined />}
              valueStyle={{ fontSize: '20px', color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Performance Chart */}
        <Col xs={24} lg={16}>
          <Card title="📈 Performance Trends" extra={<Button type="link" onClick={() => message.success('Performance details expanded!')}>View Details</Button>}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="sent" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Messages Sent"
                />
                <Line 
                  type="monotone" 
                  dataKey="delivered" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Delivered"
                />
                <Line 
                  type="monotone" 
                  dataKey="opened" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                  name="Opened"
                />
                <Line 
                  type="monotone" 
                  dataKey="clicked" 
                  stroke="#ff7c7c" 
                  strokeWidth={2}
                  name="Clicked"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Campaign Distribution */}
        <Col xs={24} lg={8}>
          <Card title="📊 Campaign Types" style={{ height: '100%' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={campaignTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {campaignTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: '16px' }}>
              {campaignTypes.map((type, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Space>
                    <div style={{ width: '12px', height: '12px', backgroundColor: type.color, borderRadius: '2px' }}></div>
                    <Text>{type.name}</Text>
                  </Space>
                  <Text strong>{type.value}%</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        {/* Recent Campaigns */}
        <Col xs={24} lg={16}>
          <Card 
            title="🚀 Recent Campaign Performance" 
            extra={<Button type="primary" onClick={() => {
              message.success('Opening All Campaigns...');
              setTimeout(() => {
                const event = new CustomEvent('navigateTo', { detail: { key: '3' } });
                window.dispatchEvent(event);
              }, 500);
            }}>View All Campaigns</Button>}
          >
            <Table
              dataSource={recentCampaigns}
              columns={campaignColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={8}>
          <Card title="🔄 Recent Activity" extra={<Button type="link" onClick={() => message.info('All activities displayed in expanded view!')}>View All</Button>}>
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item style={{ padding: '12px 0' }}>
                  <List.Item.Meta
                    avatar={<Avatar icon={item.icon} size="small" />}
                    title={
                      <div>
                        <Text strong style={{ fontSize: '13px' }}>{item.action}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          by {item.user} • {item.time}
                        </Text>
                      </div>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.details}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="⚡ Quick Actions" style={{ marginTop: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Button 
              type="primary" 
              size="large" 
              block 
              icon={<MessageOutlined />}
              className="professional-button"
              onClick={() => {
                message.success('Opening Campaign Management...');
                setTimeout(() => {
                  const event = new CustomEvent('navigateTo', { detail: { key: '3' } });
                  window.dispatchEvent(event);
                }, 500);
              }}
            >
              Create Campaign
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button 
              size="large" 
              block 
              icon={<UserOutlined />}
              className="professional-button"
              onClick={() => {
                message.info('Opening Contact Management...');
                setTimeout(() => {
                  const event = new CustomEvent('navigateTo', { detail: { key: '2' } });
                  window.dispatchEvent(event);
                }, 500);
              }}
            >
              Import Contacts
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button 
              size="large" 
              block 
              icon={<BarChartOutlined />}
              className="professional-button"
              onClick={() => {
                message.info('Opening Analytics Dashboard...');
                setTimeout(() => {
                  const event = new CustomEvent('navigateTo', { detail: { key: '5' } });
                  window.dispatchEvent(event);
                }, 500);
              }}
            >
              View Analytics
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button 
              size="large" 
              block 
              icon={<TeamOutlined />}
              className="professional-button"
              onClick={() => {
                message.info('Opening Mailing Lists Management...');
                setTimeout(() => {
                  const event = new CustomEvent('navigateTo', { detail: { key: '4' } });
                  window.dispatchEvent(event);
                }, 500);
              }}
            >
              Manage Lists
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;
