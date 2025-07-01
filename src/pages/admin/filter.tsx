const filter = () => {
  return <div>1</div>;
};

export default filter;

// <div style={{ padding: isMobile ? '16px' : '24px' }}>
// <Card>
//   {/* Mobile Filter Button */}
//   {isMobile && (
//     <Row style={{ marginBottom: 16 }}>
//       <Col span={24}>
//         <Button
//           onClick={() => setFilterDrawerVisible(true)}
//           type='default'
//           className='w-full flex items-center justify-center h-10 border border-gray-300 rounded-md
//            transition duration-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-500'
//         >
//           <Space>
//             Filters
//             {hasActiveFilters && <Badge dot />}
//           </Space>
//         </Button>
//       </Col>
//     </Row>
//   )}

//   {/* Desktop Filter Section */}
//   {!isMobile && <FilterSection />}

//   {/* Floating Active Filters */}
//   {hasActiveFilters && (
//     <Row style={{ marginBottom: 16 }}>
//       <Col span={24}>
//         <Space wrap>
//           {getActiveFilters().map((filter) => (
//             <Tag
//               key={filter.key}
//               closable
//               onClose={() => removeFilter(filter.key)}
//               closeIcon={<CloseOutlined />}
//               style={{
//                 backgroundColor: '#fff7e6',
//                 borderColor: '#ff7a00',
//                 color: '#ff7a00',
//                 fontSize: '12px',
//                 padding: '4px 8px',
//                 borderRadius: '6px',
//                 marginBottom: '4px',
//               }}
//             >
//               {filter.label}: {filter.value}
//             </Tag>
//           ))}
//           <Button
//             type='text'
//             size='small'
//             onClick={handleResetFilters}
//             style={{
//               color: '#ff7a00',
//               fontSize: '12px',
//               padding: '0 4px',
//               height: '24px',
//               marginBottom: '4px',
//             }}
//           >
//             Clear all
//           </Button>
//         </Space>
//       </Col>
//     </Row>
//   )}

//   {/* Header Section */}
//   <Row justify='space-between' align='middle' style={{ marginBottom: 16 }}>
//     <Col xs={24} sm={12}>
//       <Title
//         level={4}
//         style={{ margin: 0, color: '#333', fontSize: isMobile ? '18px' : '20px' }}
//       >
//         List of universities ({universityData?.totalCount || 0})
//       </Title>
//     </Col>
//     <Col
//       xs={24}
//       sm={12}
//       style={{ textAlign: isMobile ? 'left' : 'right', marginTop: isMobile ? 12 : 0 }}
//     >
//       <Space
//         direction={isMobile ? 'vertical' : 'horizontal'}
//         style={{ width: isMobile ? '100%' : 'auto' }}
//       >
//         {selectedRowKeys.length > 0 && (
//           <Button
//             danger
//             onClick={() => showDeleteModal('multiple')}
//             style={{ width: isMobile ? '100%' : 'auto' }}
//           >
//             Delete Selected ({selectedRowKeys.length})
//           </Button>
//         )}
//         <Button
//           type='primary'
//           icon={<PlusOutlined />}
//           onClick={() => navigate('/admin/create-university')}
//           style={{
//             backgroundColor: '#ff7a00',
//             borderColor: '#ff7a00',
//             width: isMobile ? '100%' : 'auto',
//           }}
//         >
//           Create
//         </Button>
//         <Button
//           icon={<ExportOutlined />}
//           onClick={handleExport}
//           style={{
//             backgroundColor: '#ff7a00',
//             borderColor: '#ff7a00',
//             color: 'white',
//             width: isMobile ? '100%' : 'auto',
//           }}
//         >
//           Export
//         </Button>
//       </Space>
//     </Col>
//   </Row>

//   {/* Search Results Info */}
//   {searchInput && (
//     <Row style={{ marginBottom: 16 }}>
//       <Col>
//         <div style={{ fontSize: '14px', color: '#666' }}>
//           Showing {sortedUniversities.length} results for &quot;{searchInput}&quot;
//         </div>
//       </Col>
//     </Row>
//   )}

//   {/* Table */}
//   <Table
//     columns={columns}
//     dataSource={sortedUniversities}
//     rowKey='id'
//     rowSelection={rowSelection}
//     loading={loading}
//     pagination={{
//       current: currentPage,
//       pageSize: pageSize,
//       total: universityData?.totalCount || 0,
//       onChange: (page, size) => {
//         setCurrentPage(page);
//         setPageSize(size || 12);
//       },
//       showSizeChanger: false,
//       showQuickJumper: false,
//       className: 'custom-pagination',
//       itemRender: (page, type, originalElement) => {
//         if (type === 'prev') {
//           const isDisabled = currentPage === 1;
//           return (
//             <span
//               style={{
//                 color: isDisabled ? '#d9d9d9' : '#ff7a00',
//                 fontWeight: '500',
//                 cursor: isDisabled ? 'not-allowed' : 'pointer',
//                 transition: 'color 0.2s ease',
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 gap: '4px',
//               }}
//               onMouseEnter={(e) => {
//                 if (!isDisabled) {
//                   e.currentTarget.style.color = '#ffb366';
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (!isDisabled) {
//                   e.currentTarget.style.color = '#ff7a00';
//                 }
//               }}
//             >
//               &lt; Previous
//             </span>
//           );
//         }
//         if (type === 'next') {
//           const isDisabled = currentPage >= Math.ceil(sortedUniversities.length / pageSize);
//           return (
//             <span
//               style={{
//                 color: isDisabled ? '#d9d9d9' : '#ff7a00',
//                 fontWeight: '500',
//                 cursor: isDisabled ? 'not-allowed' : 'pointer',
//                 transition: 'color 0.2s ease',
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 gap: '4px',
//               }}
//               onMouseEnter={(e) => {
//                 if (!isDisabled) {
//                   e.currentTarget.style.color = '#ffb366';
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (!isDisabled) {
//                   e.currentTarget.style.color = '#ff7a00';
//                 }
//               }}
//             >
//               Next &gt;
//             </span>
//           );
//         }
//         if (type === 'jump-prev' || type === 'jump-next') {
//           return <span style={{ color: '#999' }}>•••</span>;
//         }
//         return originalElement;
//       },
//       style: {
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         width: '100%',
//         marginTop: '24px',
//         marginBottom: '16px',
//       },
//     }}
//     scroll={{ x: 800 }}
//     style={{ marginBottom: 16 }}
//   />
// </Card>
// </div>
