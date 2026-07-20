"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const admin_module_1 = require("./admin/admin.module");
const ad_categories_module_1 = require("./ad-categories/ad-categories.module");
const ads_module_1 = require("./ads/ads.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const catalog_collections_module_1 = require("./catalog-collections/catalog-collections.module");
const config_module_1 = require("./config/config.module");
const feed_module_1 = require("./feed/feed.module");
const market_categories_module_1 = require("./market-categories/market-categories.module");
const market_module_1 = require("./market/market.module");
const favourites_module_1 = require("./favourites/favourites.module");
const orders_module_1 = require("./orders/orders.module");
const payments_module_1 = require("./payments/payments.module");
const prisma_module_1 = require("./prisma/prisma.module");
const products_module_1 = require("./products/products.module");
const referrals_module_1 = require("./referrals/referrals.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            throttler_1.ThrottlerModule.forRoot({
                throttlers: [{ ttl: 60_000, limit: 100 }],
            }),
            prisma_module_1.PrismaModule,
            products_module_1.ProductsModule,
            market_categories_module_1.MarketCategoriesModule,
            catalog_collections_module_1.CatalogCollectionsModule,
            market_module_1.MarketModule,
            ad_categories_module_1.AdCategoriesModule,
            ads_module_1.AdsModule,
            feed_module_1.FeedModule,
            favourites_module_1.FavouritesModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            referrals_module_1.ReferralsModule,
            admin_module_1.AdminModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map