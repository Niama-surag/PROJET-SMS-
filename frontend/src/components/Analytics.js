import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Select,
  DatePicker,
  Typography,
  Progress,
  Tag,
  Space,
  Button,
  message,
  Modal,
} from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  TrophyOutlined,
  SendOutlined,
  EyeOutlined,
  LinkOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [advancedReportsVisible, setAdvancedReportsVisible] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Mock data for demonstration
  const performanceData = [
    { date: '2025-08-20', sent: 1200, delivered: 1140, opened: 855, clicked: 342 },
    { date: '2025-08-21', sent: 1350, delivered: 1283, opened: 962, clicked: 385 },
    { date: '2025-08-22', sent: 1100, delivered: 1045, opened: 784, clicked: 314 },
    { date: '2025-08-23', sent: 1450, delivered: 1378, opened: 1034, clicked: 413 },
    { date: '2025-08-24', sent: 1600, delivered: 1520, opened: 1140, clicked: 456 },
    { date: '2025-08-25', sent: 1250, delivered: 1188, opened: 891, clicked: 356 },
    { date: '2025-08-26', sent: 1400, delivered: 1330, opened: 998, clicked: 399 },
  ];

  const campaignTypeData = [
    { name: 'Promotional', value: 45, color: '#1890ff' },
    { name: 'Welcome', value: 25, color: '#52c41a' },
    { name: 'Reminder', value: 20, color: '#faad14' },
    { name: 'Notification', value: 10, color: '#f5222d' },
  ];

  const regionData = [
    { region: 'Paris', contacts: 420, delivered: 398, opened: 299 },
    { region: 'Lyon', contacts: 315, delivered: 299, opened: 224 },
    { region: 'Marseille', contacts: 280, delivered: 266, opened: 199 },
    { region: 'Toulouse', contacts: 190, delivered: 181, opened: 136 },
    { region: 'Nice', contacts: 150, delivered: 143, opened: 107 },
  ];

  const recentCampaigns = [
    {
      id: 1,
      name: 'Summer Sale Campaign',
      type: 'Promotional',
      sent: 1500,
      delivered: 1425,
      opened: 1068,
      clicked: 427,
      deliveryRate: 95,
      openRate: 75,
      clickRate: 40,
      status: 'Completed'
    },
    {
      id: 2,
      name: 'Welcome Series',
      type: 'Welcome',
      sent: 850,
      delivered: 808,
      opened: 566,
      clicked: 170,
      deliveryRate: 95,
      openRate: 70,
      clickRate: 30,
      status: 'Active'
    },
    {
      id: 3,
      name: 'Product Launch',
      type: 'Notification',
      sent: 2200,
      delivered: 2090,
      opened: 1463,
      clicked: 439,
      deliveryRate: 95,
      openRate: 70,
      clickRate: 30,
      status: 'Completed'
    },
  ];

  const totalStats = {
    totalSent: performanceData.reduce((sum, day) => sum + day.sent, 0),
    totalDelivered: performanceData.reduce((sum, day) => sum + day.delivered, 0),
    totalOpened: performanceData.reduce((sum, day) => sum + day.opened, 0),
    totalClicked: performanceData.reduce((sum, day) => sum + day.clicked, 0),
  };

  const deliveryRate = ((totalStats.totalDelivered / totalStats.totalSent) * 100).toFixed(1);
  const openRate = ((totalStats.totalOpened / totalStats.totalDelivered) * 100).toFixed(1);
  const clickRate = ((totalStats.totalClicked / totalStats.totalOpened) * 100).toFixed(1);

  const campaignColumns = [
    {
      title: 'Campaign',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'Promotional' ? 'blue' : type === 'Welcome' ? 'green' : 'orange'}>
          {type}
        </Tag>
      ),
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
      render: (value) => value.toLocaleString(),
    },
    {
      title: 'Delivery Rate',
      dataIndex: 'deliveryRate',
      key: 'deliveryRate',
      render: (rate) => (
        <Progress 
          percent={rate} 
          size="small" 
          strokeColor={rate > 90 ? '#52c41a' : rate > 80 ? '#faad14' : '#f5222d'}
        />
      ),
    },
    {
      title: 'Open Rate',
      dataIndex: 'openRate',
      key: 'openRate',
      render: (rate) => (
        <Progress 
          percent={rate} 
          size="small" 
          strokeColor={rate > 60 ? '#52c41a' : rate > 40 ? '#faad14' : '#f5222d'}
        />
      ),
    },
    {
      title: 'Click Rate',
      dataIndex: 'clickRate',
      key: 'clickRate',
      render: (rate) => (
        <Progress 
          percent={rate} 
          size="small" 
          strokeColor={rate > 30 ? '#52c41a' : rate > 20 ? '#faad14' : '#f5222d'}
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'processing' : 'success'}>
          {status}
        </Tag>
      ),
    },
  ];

  // Export Functions
  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      const element = document.getElementById('analytics-content');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      // Add title
      pdf.setFontSize(20);
      pdf.text('SMS Campaign Analytics Report', 20, 20);
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
      pdf.text(`Time Range: ${timeRange}`, 20, 35);
      pdf.text(`Campaign Filter: ${selectedCampaign}`, 20, 40);
      
      position = 50;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`SMS_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      message.success('PDF report downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Failed to generate PDF report');
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportExcel = () => {
    setExportingExcel(true);
    try {
      const workbook = XLSX.utils.book_new();
      
      // Summary Sheet
      const summaryData = [
        ['SMS Campaign Analytics Report'],
        ['Generated on:', new Date().toLocaleString()],
        ['Time Range:', timeRange],
        ['Campaign Filter:', selectedCampaign],
        [''],
        ['Summary Statistics'],
        ['Total Messages Sent', totalStats.totalSent],
        ['Total Messages Delivered', totalStats.totalDelivered],
        ['Total Messages Opened', totalStats.totalOpened],
        ['Total Messages Clicked', totalStats.totalClicked],
        ['Delivery Rate', deliveryRate + '%'],
        ['Open Rate', openRate + '%'],
        ['Click Rate', clickRate + '%'],
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      // Performance Data Sheet
      const performanceSheet = XLSX.utils.json_to_sheet(performanceData);
      XLSX.utils.book_append_sheet(workbook, performanceSheet, 'Daily Performance');
      
      // Campaigns Data Sheet
      const campaignData = recentCampaigns.map(campaign => ({
        'Campaign Name': campaign.name,
        'Type': campaign.type,
        'Messages Sent': campaign.sent,
        'Messages Delivered': campaign.delivered,
        'Messages Opened': campaign.opened,
        'Messages Clicked': campaign.clicked,
        'Delivery Rate (%)': campaign.deliveryRate,
        'Open Rate (%)': campaign.openRate,
        'Click Rate (%)': campaign.clickRate,
        'Status': campaign.status
      }));
      
      const campaignsSheet = XLSX.utils.json_to_sheet(campaignData);
      XLSX.utils.book_append_sheet(workbook, campaignsSheet, 'Campaigns');
      
      // Geographic Data Sheet
      const geographicSheet = XLSX.utils.json_to_sheet(regionData);
      XLSX.utils.book_append_sheet(workbook, geographicSheet, 'Geographic Data');
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const excelData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(excelData, `SMS_Analytics_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      message.success('Excel report exported successfully!');
    } catch (error) {
      console.error('Error generating Excel:', error);
      message.error('Failed to generate Excel report');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleAdvancedReports = () => {
    setAdvancedReportsVisible(true);
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>📊 Analytics & Reports</Title>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<DownloadOutlined />} 
              className="professional-button"
              onClick={handleExportPDF}
              loading={exportingPDF}
            >
              Export PDF
            </Button>
            <Button 
              icon={<FileExcelOutlined />} 
              className="professional-button"
              onClick={handleExportExcel}
              loading={exportingExcel}
            >
              Export Excel
            </Button>
            <Button 
              type="primary" 
              icon={<BarChartOutlined />}
              className="professional-button"
              onClick={handleAdvancedReports}
            >
              Advanced Reports
            </Button>
          </Space>
        </Col>
      </Row>
      
      <div id="analytics-content">
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
          >
            <Option value="7days">Last 7 days</Option>
            <Option value="30days">Last 30 days</Option>
            <Option value="90days">Last 90 days</Option>
          </Select>
        </Col>
        <Col>
          <Select
            value={selectedCampaign}
            onChange={setSelectedCampaign}
            style={{ width: 200 }}
          >
            <Option value="all">All Campaigns</Option>
            <Option value="promotional">Promotional</Option>
            <Option value="welcome">Welcome</Option>
            <Option value="reminder">Reminder</Option>
          </Select>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Messages Sent"
              value={totalStats.totalSent}
              prefix={<SendOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Delivery Rate"
              value={deliveryRate}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Open Rate"
              value={openRate}
              suffix="%"
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Click Rate"
              value={clickRate}
              suffix="%"
              prefix={<LinkOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Performance Trends">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sent" stroke="#1890ff" name="Sent" />
                <Line type="monotone" dataKey="delivered" stroke="#52c41a" name="Delivered" />
                <Line type="monotone" dataKey="opened" stroke="#722ed1" name="Opened" />
                <Line type="monotone" dataKey="clicked" stroke="#faad14" name="Clicked" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Campaign Types Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={campaignTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {campaignTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Regional Performance */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Regional Performance">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="contacts" fill="#1890ff" name="Total Contacts" />
                <Bar dataKey="delivered" fill="#52c41a" name="Delivered" />
                <Bar dataKey="opened" fill="#722ed1" name="Opened" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Campaign Performance Table */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Campaign Performance Details">
            <Table
              columns={campaignColumns}
              dataSource={recentCampaigns}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
      </div>

      {/* Advanced Reports Modal */}
      <Modal
        title="🚀 Advanced Analytics Dashboard"
        visible={advancedReportsVisible}
        onCancel={() => setAdvancedReportsVisible(false)}
        width={1200}
        footer={[
          <Button key="close" onClick={() => setAdvancedReportsVisible(false)}>
            Close
          </Button>,
          <Button key="export" type="primary" onClick={handleExportPDF}>
            Export Advanced Report
          </Button>
        ]}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="ROI (Return on Investment)"
                value={245.8}
                precision={1}
                valueStyle={{ color: '#3f8600' }}
                prefix="$"
                suffix="%"
              />
              <Text type="secondary">Campaign profitability analysis</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Customer Lifetime Value"
                value={1542.50}
                precision={2}
                valueStyle={{ color: '#1890ff' }}
                prefix="$"
              />
              <Text type="secondary">Average value per customer</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Conversion Rate"
                value={12.8}
                precision={1}
                valueStyle={{ color: '#cf1322' }}
                suffix="%"
              />
              <Text type="secondary">Message to purchase conversion</Text>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="📈 Revenue Attribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="clicked" fill="#8884d8" name="Revenue ($)" />
                  <Bar dataKey="opened" fill="#82ca9d" name="Attributed Sales" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="🎯 Customer Segmentation">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'New Customers', value: 35, fill: '#0088FE' },
                      { name: 'Returning Customers', value: 45, fill: '#00C49F' },
                      { name: 'VIP Customers', value: 20, fill: '#FFBB28' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'New Customers', value: 35, fill: '#0088FE' },
                      { name: 'Returning Customers', value: 45, fill: '#00C49F' },
                      { name: 'VIP Customers', value: 20, fill: '#FFBB28' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="📊 Advanced Metrics">
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <Statistic title="Bounce Rate" value={2.4} suffix="%" />
                </Col>
                <Col span={6}>
                  <Statistic title="Unsubscribe Rate" value={0.8} suffix="%" />
                </Col>
                <Col span={6}>
                  <Statistic title="Forward Rate" value={5.2} suffix="%" />
                </Col>
                <Col span={6}>
                  <Statistic title="Spam Reports" value={0.1} suffix="%" />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default Analytics;
