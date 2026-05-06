import Document from "../models/search/midlewareSearch.js";


export const searchDocuments = async (req, res) => {
  try {
    const { q, workspaceId } = req.query;

    
    let filter = {
        title: { $regex: q || "", $options: 'i' } 
    };

    
    if (workspaceId) {
        filter.workspaceId = workspaceId;
    }

    
    const results = await Document.find(filter).select("title slug");

    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });

    console.log("User ne search kiya:", q);
  } catch (error) {
    console.log("Ye search ka error hai:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};