import slugify from "slugify";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { subCategoryModel } from "./../../../Database/models/subcategory.model.js";
import { deleteOne } from "../../handlers/factor.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";

const  addSubCategory = catchAsyncError(async (req, res, next) => {
  var data = {
    name: req.body.name,
    slug: slugify(req.body.name),
    category: req.params.categoryId
  }
  console.log('data: ', data);
  const addSubcategory = new subCategoryModel(data);
  await addSubcategory.save();

  res.status(201).json({ message: "success", addSubcategory });
});

const getAllSubCategories = catchAsyncError(async (req, res, next) => {
  console.log(req.params);
  let filterObj = {};

  
  if (req.params.categoryId) {
    filterObj = { category: req.params.categoryId };
  }

  const apiFeature = new ApiFeatures(
    subCategoryModel.find(filterObj),
    req.query
  ).filteration();

  // Execute the query
  const getAllSubCategories = await apiFeature.mongooseQuery;

  res.status(201).json({ message: "success", getAllSubCategories });
});

const updateSubCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.name) {
    req.body.slug = slugify(req.body.name);
  }
  const updateSubCategory = await subCategoryModel.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
    }
  );

  updateSubCategory &&
    res.status(201).json({ message: "success", updateSubCategory });

  !updateSubCategory && next(new AppError("subcategory was not found", 404));
});

const deleteSubCategory = deleteOne(subCategoryModel, "subcategory");
export {
  addSubCategory,
  getAllSubCategories,
  updateSubCategory,
  deleteSubCategory,
};
