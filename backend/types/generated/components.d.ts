import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksImageHighlight extends Struct.ComponentSchema {
  collectionName: 'components_blocks_image_highlights';
  info: {
    description: '\u0418\u043B\u043B\u044E\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u0432\u043D\u0443\u0442\u0440\u0438 \u043F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u0438';
    displayName: '\u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0441 \u043F\u043E\u0434\u043F\u0438\u0441\u044C\u044E';
  };
  attributes: {
    caption: Schema.Attribute.String;
    credit: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface BlocksQuote extends Struct.ComponentSchema {
  collectionName: 'components_blocks_quotes';
  info: {
    description: '\u0412\u044B\u0434\u0435\u043B\u0435\u043D\u043D\u0430\u044F \u0446\u0438\u0442\u0430\u0442\u0430 \u0432 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u0435';
    displayName: '\u0426\u0438\u0442\u0430\u0442\u0430';
  };
  attributes: {
    author: Schema.Attribute.String;
    role: Schema.Attribute.String;
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface BlocksRichText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_rich_texts';
  info: {
    description: '\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 rich text \u0431\u043B\u043E\u043A';
    displayName: '\u0422\u0435\u043A\u0441\u0442\u043E\u0432\u044B\u0439 \u0431\u043B\u043E\u043A';
  };
  attributes: {
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
    title: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'SEO-\u043F\u043E\u043B\u044F \u0434\u043B\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446 \u0438 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u043E\u0432';
    displayName: 'SEO';
  };
  attributes: {
    canonicalUrl: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    noFollow: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    noIndex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface TastingNote extends Struct.ComponentSchema {
  collectionName: 'components_tasting_notes';
  info: {
    description: '\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0434\u0435\u0433\u0443\u0441\u0442\u0430\u0446\u0438\u0438 \u0438 \u0440\u0430\u0434\u0430\u0440\u043D\u043E\u0439 \u0434\u0438\u0430\u0433\u0440\u0430\u043C\u043C\u044B';
    displayName: '\u0414\u0435\u0433\u0443\u0441\u0442\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u0437\u0430\u043C\u0435\u0442\u043A\u0430';
  };
  attributes: {
    acidity: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    aroma: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    body: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    finish: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    pairing: Schema.Attribute.Text;
    servingTemperature: Schema.Attribute.String;
    summary: Schema.Attribute.Text;
    sweetness: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    tannins: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    taste: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.image-highlight': BlocksImageHighlight;
      'blocks.quote': BlocksQuote;
      'blocks.rich-text': BlocksRichText;
      'shared.seo': SharedSeo;
      'tasting.note': TastingNote;
    }
  }
}
