import mongoose,{ Document, model,Model, Schema } from "mongoose";

interface IFAQ extends Document {
  question: string;
  answer: string;
}
interface ICategory extends Document {
  title: string;
}
interface IBannerImage extends Document {
  public_id: string;
  url: string;
}
interface ILayout extends Document {
  type: string;
  faqs: IFAQ[];
  categories: ICategory[];
  banner: {
    image: IBannerImage;
    title: string;
    subtitle: string;
  };
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String },
    answer: { type: String },
  },
  { timestamps: true }
);

const CategorySchema = new Schema<ICategory>(
  {
    title: { type: String },
  },
  { timestamps: true }
);

const BannerImageSchema = new Schema<IBannerImage>(
  {
    public_id: { type: String },
    url: { type: String },
  },
  { timestamps: true }
);

const LayoutSchema = new Schema<ILayout>(
  {
    type: { type: String, required: [true,"type is required"] },
    faqs: [FAQSchema],
    categories: [CategorySchema],
    banner: {
      image: BannerImageSchema,
      title: { type: String },
      subtitle: { type: String},
    },
  },
  { timestamps: true }
);

const Layout: Model<ILayout> = model("Layout", LayoutSchema);
export default Layout;
