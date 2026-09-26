const Product = require('../models/Product');

// Helper to escape special regex characters from user search input
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @desc    Get all products with filtering, search, sorting, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, q, sort } = req.query;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    // Build Match Stage
    const matchStage = {};

    // 1. Partial/substring keyword search on name and description (escaped regex)
    if (q && q.trim()) {
      const sanitized = escapeRegex(q.trim());
      const searchRegex = new RegExp(sanitized, 'i');
      matchStage.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    // 2. Category filter
    if (category && category.trim()) {
      matchStage.category = category.trim();
    }

    // 3. Variant price filtering using $elemMatch
    const minPriceNum = minPrice !== undefined ? parseFloat(minPrice) : undefined;
    const maxPriceNum = maxPrice !== undefined ? parseFloat(maxPrice) : undefined;

    if (minPriceNum !== undefined || maxPriceNum !== undefined) {
      const priceCondition = {};
      if (minPriceNum !== undefined) priceCondition.$gte = minPriceNum;
      if (maxPriceNum !== undefined) priceCondition.$lte = maxPriceNum;

      matchStage.variants = {
        $elemMatch: {
          price: priceCondition
        }
      };
    }

    // Determine Sort Stage using calculated variant price
    let sortStage = {};
    if (sort === 'price_asc') {
      sortStage = { minVariantPrice: 1, _id: 1 };
    } else if (sort === 'price_desc') {
      sortStage = { maxVariantPrice: -1, _id: 1 };
    } else {
      // Default & 'newest'
      sortStage = { createdAt: -1, _id: 1 };
    }

    // Aggregation Pipeline for server-side processing & pagination facet
    const pipeline = [
      { $match: matchStage },
      {
        $addFields: {
          minVariantPrice: { $min: '$variants.price' },
          maxVariantPrice: { $max: '$variants.price' }
        }
      },
      { $sort: sortStage },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                name: 1,
                slug: 1,
                category: 1,
                images: 1,
                description: 1,
                variants: {
                  sku: 1,
                  size: 1,
                  colour: 1,
                  price: 1,
                  stock: 1
                },
                minVariantPrice: 1,
                maxVariantPrice: 1,
                createdAt: 1
              }
            }
          ]
        }
      }
    ];

    const [result] = await Product.aggregate(pipeline);

    const total = result.metadata.length > 0 ? result.metadata[0].total : 0;
    const pages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unique product categories with product counts
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1
        }
      },
      {
        $sort: { category: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug: slug.toLowerCase() }).lean().exec();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getCategories,
  getProductBySlug
};
