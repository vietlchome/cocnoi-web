const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Bắt đầu dọn dẹp dữ liệu cũ (tuân thủ giới hạn khóa ngoại)...')
  await prisma.siteSettings.deleteMany()
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.orderInquiry.deleteMany()
  await prisma.order.deleteMany()
  await prisma.customerNote.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.productGroup.deleteMany()
  await prisma.colorOption.deleteMany()
  await prisma.sizeOption.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('Tiến hành tạo tài khoản Quản trị viên (Admin)...')
  const adminPassword = await bcrypt.hash('admin123', 10)
  
  await prisma.user.create({
    data: {
      name: 'CocNoi Admin',
      email: 'admin@cocnoi.vn',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  console.log('Tạo tài khoản Khách hàng mẫu...')
  const userPassword = await bcrypt.hash('user123', 10)
  
  await prisma.user.create({
    data: {
      name: 'Nguyen Van Khach',
      email: 'khachhang@example.com',
      password: userPassword,
      role: 'USER',
    },
  })

  console.log('Tạo các Danh mục (Categories)...')
  const categoriesData = [
    { name: 'Đôi Cốc Sứ (Mug & Beaker)', slug: 'doi-coc-su' },
    { name: 'Cốc Thủy Tinh Hai Lớp', slug: 'coc-thuy-tinh' },
    { name: 'Cốc Giữ Nhiệt Tiện Lợi', slug: 'coc-giu-nhiet' },
    { name: 'Bộ Quà Tặng Sang Trọng', slug: 'bo-qua-tang' },
    { name: 'Phụ Kiện Cốc Độc Đáo', slug: 'phu-kien-coc' },
  ]

  const categories = []
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: cat
    })
    categories.push(createdCat)
  }

  // Danh sách ảnh mẫu từ Unsplash (Tỷ lệ 1:1 hoặc vuông vắn)
  const mugImages = [
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1536304997881-a372c179924b?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517256064527-09c53b2d0c6b?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1520981172588-ac0d51aa27d7?w=600&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&h=600&fit=crop&q=80'
  ]

  console.log('Tạo các Sản phẩm theo mô hình Flat Catalog và triết lý Cốc Nối...')

  const rawProducts = [
    // 1. BST Fu Rung
    {
      name: 'Đôi Cốc Fu Rung - Hoa Phù Dung - Mug-S',
      slug: 'doi-coc-fu-rung-mug-s',
      description: '<p>Cảm hứng từ hoa phù dung đổi sắc. Một đôi gồm 2 cốc Mug-S cùng hoạ tiết nhưng khác biệt ở cách hoàn thiện.</p>',
      price: 400000,
      compareAtPrice: null,
      stockQuantity: 20,
      weight: 450,
      images: JSON.stringify([mugImages[0], mugImages[1]]),
      categoryId: categories[0].id,
      productGroupId: 'fu-rung',
      colorName: 'Hồng Phù Dung',
      colorHex: '#FFC0CB',
      size: 'Mug-S'
    },
    {
      name: 'Đôi Cốc Fu Rung - Hoa Phù Dung - Mug-L',
      slug: 'doi-coc-fu-rung-mug-l',
      description: '<p>Phiên bản Mug-L của bộ Fu Rung. Thể tích lớn hơn, hoàn hảo cho trà hoặc cà phê nhiều nước.</p>',
      price: 450000,
      compareAtPrice: null,
      stockQuantity: 15,
      weight: 550,
      images: JSON.stringify([mugImages[1], mugImages[2]]),
      categoryId: categories[0].id,
      productGroupId: 'fu-rung',
      colorName: 'Hồng Phù Dung',
      colorHex: '#FFC0CB',
      size: 'Mug-L'
    },

    // 2. BST Lanh
    {
      name: 'Đôi Cốc Lanh - Thổ Cẩm Sợi Lanh - Beaker-S',
      slug: 'doi-coc-lanh-beaker-s',
      description: '<p>Cảm hứng từ sợi lanh vùng cao do người H\'Mông dệt. Cốc Beaker-S dáng không quai, giữ lại độ nhám của sợi mộc.</p>',
      price: 270000,
      compareAtPrice: 320000,
      stockQuantity: 25,
      weight: 350,
      images: JSON.stringify([mugImages[2], mugImages[3]]),
      categoryId: categories[0].id,
      productGroupId: 'lanh',
      colorName: 'Mộc Sợi Lanh',
      colorHex: '#D2B48C',
      size: 'Beaker-S'
    },
    
    // 3. BST Mano
    {
      name: 'Đôi Cốc Mano - Vẽ Tay - Mug-S',
      slug: 'doi-coc-mano-mug-s',
      description: '<p>Mọi chiếc cốc đều đi qua bàn tay người thợ trước khi đến tay bạn. Hoạ tiết vẽ tay phóng khoáng tự do.</p>',
      price: 400000,
      compareAtPrice: null,
      stockQuantity: 30,
      weight: 450,
      images: JSON.stringify([mugImages[3], mugImages[4]]),
      categoryId: categories[0].id,
      productGroupId: 'mano',
      colorName: 'Cream Nâu',
      colorHex: '#F5DEB3',
      size: 'Mug-S'
    },

    // 4. BST Asa
    {
      name: 'Đôi Cốc Asa - Men Sáng Tối Giản - Beaker-L',
      slug: 'doi-coc-asa-beaker-l',
      description: '<p>Asa nghĩa là sáng sớm. Men sáng, form tối giản, dành cho chiếc cốc đầu tiên trong ngày.</p>',
      price: 420000,
      compareAtPrice: null,
      stockQuantity: 10,
      weight: 500,
      images: JSON.stringify([mugImages[4], mugImages[5]]),
      categoryId: categories[0].id,
      productGroupId: 'asa',
      colorName: 'Trắng Sữa Sáng',
      colorHex: '#FFFFFF',
      size: 'Beaker-L'
    },

    // 5. BST Terra
    {
      name: 'Đôi Cốc Terra - Đất Nguyên Bản - Mug-L',
      slug: 'doi-coc-terra-mug-l',
      description: '<p>Terra — đất. Trở về với nguyên bản. Men đất mộc sần, giữ trọn sắc đỏ nâu tự nhiên.</p>',
      price: 450000,
      compareAtPrice: 500000,
      stockQuantity: 15,
      weight: 550,
      images: JSON.stringify([mugImages[5], mugImages[0]]),
      categoryId: categories[0].id,
      productGroupId: 'terra',
      colorName: 'Đỏ Nâu Đất',
      colorHex: '#8B4513',
      size: 'Mug-L'
    },

    // 6. BST Dara
    {
      name: 'Đôi Cốc Dara - Men Bền Cổ Điển - Beaker-L',
      slug: 'doi-coc-dara-beaker-l',
      description: '<p>Dara — sồi. Những chiếc cốc sinh ra để đồng hành cùng bạn lâu hơn một mùa. Vững chãi, dày dặn.</p>',
      price: 420000,
      compareAtPrice: null,
      stockQuantity: 20,
      weight: 500,
      images: JSON.stringify([mugImages[0], mugImages[2]]),
      categoryId: categories[0].id,
      productGroupId: 'dara',
      colorName: 'Xanh Lá Sồi',
      colorHex: '#556B2F',
      size: 'Beaker-L'
    },

    // 7. BST Nami
    {
      name: 'Đôi Cốc Nami - Men Chảy Gợn Sóng - Beaker-S',
      slug: 'doi-coc-nami-beaker-s',
      description: '<p>Nami — sóng. Lớp men chảy theo trọng lực trong lò nung tạo thành những đường gợn ngẫu nhiên không lặp lại.</p>',
      price: 270000,
      compareAtPrice: null,
      stockQuantity: 15,
      weight: 350,
      images: JSON.stringify([mugImages[1], mugImages[3]]),
      categoryId: categories[0].id,
      productGroupId: 'nami',
      colorName: 'Xanh Nước Biển',
      colorHex: '#1E90FF',
      size: 'Beaker-S'
    },

    // 8. BST Covo
    {
      name: 'Đôi Cốc Covo - Hốc Ấm - Mug-L',
      slug: 'doi-coc-covo-mug-l',
      description: '<p>Covo — hốc nhỏ. Chiếc cốc hoàn hảo để cuộn tròn trong lòng bàn tay những ngày mùa đông lạnh.</p>',
      price: 450000,
      compareAtPrice: 500000,
      stockQuantity: 25,
      weight: 550,
      images: JSON.stringify([mugImages[2], mugImages[4]]),
      categoryId: categories[0].id,
      productGroupId: 'covo',
      colorName: 'Xám Len Khói',
      colorHex: '#696969',
      size: 'Mug-L'
    }
  ]

  console.log('Tạo các Kích cỡ, Màu sắc và Bộ sưu tập từ dữ liệu mẫu...')
  
  // 1. Tạo các bộ sưu tập (ProductGroups)
  const groupMap = new Map()
  const groupsData = [
    { id: 'fu-rung', name: 'Fu Rung', slug: 'fu-rung' },
    { id: 'lanh', name: 'Lanh', slug: 'lanh' },
    { id: 'mano', name: 'Mano', slug: 'mano' },
    { id: 'asa', name: 'Asa', slug: 'asa' },
    { id: 'terra', name: 'Terra', slug: 'terra' },
    { id: 'dara', name: 'Dara', slug: 'dara' },
    { id: 'nami', name: 'Nami', slug: 'nami' },
    { id: 'covo', name: 'Covo', slug: 'covo' },
  ]
  for (const g of groupsData) {
    const group = await prisma.productGroup.create({
      data: { id: g.id, name: g.name, slug: g.slug }
    })
    groupMap.set(g.id, group)
  }

  // 2. Tạo các Màu Sắc (ColorOptions)
  const colorMap = new Map()
  const uniqueColors = []
  const colorNamesSeen = new Set()
  for (const p of rawProducts) {
    if (p.colorName && !colorNamesSeen.has(p.colorName)) {
      colorNamesSeen.add(p.colorName)
      uniqueColors.push({ name: p.colorName, hex: p.colorHex })
    }
  }
  for (const c of uniqueColors) {
    const colorOpt = await prisma.colorOption.create({
      data: { name: c.name, hex: c.hex }
    })
    colorMap.set(c.name, colorOpt)
  }

  // 3. Tạo các Kích Cỡ (SizeOptions) dựa trên danh mục của sản phẩm
  const sizeMap = new Map()
  for (const p of rawProducts) {
    const key = `${p.size}_${p.categoryId}`
    if (!sizeMap.has(key)) {
      const sizeOpt = await prisma.sizeOption.create({
        data: {
          name: p.size,
          categoryId: p.categoryId
        }
      })
      sizeMap.set(key, sizeOpt)
    }
  }

  console.log('Tiến hành nạp dữ liệu Flat Product...')
  let pIdx = 0
  for (const p of rawProducts) {
    pIdx++
    const sku = `CN-${String(pIdx).padStart(3, '0')}`
    const shortDescription = 'Đôi cốc "soul-mate" hiện thân vật lý của triết lý Cốc Nối. Sản phẩm dành cho hai người có chung tinh thần nhưng giữ cá tính riêng.'
    
    const { colorName, colorHex, size, ...productFields } = p
    await prisma.product.create({
      data: {
        ...productFields,
        sku,
        shortDescription,
        colorId: colorMap.get(colorName)?.id || null,
        sizeId: sizeMap.get(`${size}_${p.categoryId}`)?.id || null,
        isActive: true
      }
    })
  }

  console.log('Khởi tạo cấu hình giao diện mặc định (SiteSettings)...')
  await prisma.siteSettings.create({
    data: {
      key: 'main_config',
      value: {
        global: {
          logoUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=200&q=80',
          faviconUrl: '',
          hotline: '0987.654.321',
          email: 'hello@cocnoi.vn',
          address: 'Làng gốm Bát Tràng, Gia Lâm, Hà Nội',
          facebookUrl: 'https://facebook.com/cocnoi',
          instagramUrl: 'https://instagram.com/cocnoi',
          zaloUrl: '0987654321',
        },
        hero: {
          imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1920&q=80',
          title: 'CỐC NỐI — Gốm Mộc & Nghệ Thuật Sống',
          subtitle: 'Nối kết giá trị thủ công truyền thống vào nhịp sống hiện đại qua những tác phẩm gốm mộc độc bản.',
        },
        features: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1565192647048-f997ed87f5e2?auto=format&fit=crop&w=600&q=80',
            title: 'Đất Nung Thô Sần',
            linkUrl: '/shop',
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
            title: 'Men Tro Độc Bản',
            linkUrl: '/shop',
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=600&q=80',
            title: 'Tác Phẩm Độc Bản',
            linkUrl: '/shop',
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80',
            title: 'Kỹ Thuật Vuốt Tay',
            linkUrl: '/shop',
          },
        ],
        faqsB2C: [
          {
            question: 'Cốc Nối có ship tỉnh không và nếu vỡ gốm thì xử lý thế nào?',
            answer: 'Cốc Nối giao hàng toàn quốc. Đối với đồ gốm sứ dễ vỡ, chúng tôi đóng gói chống sốc chuyên dụng 3 lớp. Trong trường hợp hi hữu sản phẩm bị sứt mẻ/nứt vỡ do vận chuyển, Cốc Nối cam kết đền bù 1-đổi-1 miễn phí hoặc hoàn tiền 100% khi nhận được video khui hàng của quý khách.',
          },
          {
            question: 'Đồ gốm mộc của Cốc Nối có dùng được trong lò vi sóng không?',
            answer: 'Tất cả các sản phẩm gốm mộc tại Cốc Nối đều được nung ở nhiệt độ cao trên 1250°C, khử hoàn toàn kim loại nặng, tuyệt đối an toàn để sử dụng trong lò vi sóng, lò nướng và máy rửa bát.',
          },
        ],
        faqsB2B: [
          {
            question: 'Chính sách chiết khấu gốm sỉ quà tặng doanh nghiệp như thế nào?',
            answer: 'Chúng tôi hỗ trợ mức chiết khấu cực kỳ ưu đãi từ 15% - 35% tùy thuộc vào số lượng đặt hàng thực tế. Cốc Nối cũng cung cấp dịch vụ in ấn logo doanh nghiệp dập chìm/dưới men cao cấp cho các đơn hàng quà tặng.',
          },
          {
            question: 'Thời gian hoàn thiện đơn hàng quà tặng doanh nghiệp số lượng lớn là bao lâu?',
            answer: 'Với năng lực sản xuất tại xưởng gốm thủ công của Cốc Nối, thời gian sản xuất dao động từ 15 - 25 ngày kể từ ngày ký hợp đồng và duyệt mẫu thử nghiệm. Vui lòng liên hệ hotline B2B để nhận tiến độ chính xác nhất.',
          },
        ],
      }
    }
  })

  console.log('✅ Đã nạp thành công hệ thống dữ liệu mẫu Flat Product mới và SiteSettings mặc định!')
  console.log(`Tài khoản Admin: admin@cocnoi.vn | Mật khẩu: admin123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
