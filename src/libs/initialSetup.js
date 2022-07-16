//const { User, Role } = require("../models/index");

const bcrypt = require("bcryptjs");

module.exports.createRoles = async () => {
  /* try {
    // Count Documents
    const count = await Role.estimatedDocumentCount();

    // check for existing roles
    if (count > 0) return;

    // Create default Roles
    const values = await Promise.all([
      new Role({ name: "user" }).save(),
      new Role({ name: "moderator" }).save(),
      new Role({ name: "admin" }).save(),
      new Role({ name: "teacher" }).save(),
    ]);

    console.log(values);
  } catch (error) {
    console.error(error);
  } */
};

module.exports.createAdmin = async () => {
  // check for an existing admin user
  //const user = await User.findOne({ email: "admin@localhost" });
  // get roles _id
  //const roles = await Role.find({ name: { $in: ["admin", "moderator"] } });
  /* if (!user) {
    // create a new admin user
    await User.create({
      roles: ["admin", "moderator"],
      routes: [
        {
          label: "Dashboard",
          labelDisable: true,
          children: [
            {
              name: "Dashboard",
              active: true,
              icon: "chart-pie",
              children: [
                {
                  name: "Default",
                  to: "/dashboard/default",
                  active: true,
                },
                {
                  name: "Analytics",
                  to: "/dashboard/analytics",
                  active: true,
                },
                {
                  name: "CRM",
                  to: "/dashboard/crm",
                },
                {
                  name: "E Commerce",
                  to: "/dashboard/e-commerce",
                },
                {
                  name: "Management",
                  to: "/dashboard/project-management",
                },
                {
                  name: "SaaS",
                  to: "/dashboard/saas",
                },
              ],
            },
          ],
        },
        {
          label: "app",
          children: [
            {
              name: "Calendar",
              icon: "calendar-alt",
              to: "/app/calendar",
            },
            {
              name: "Chat",
              icon: "comments",
              to: "/app/chat",
            },
            {
              name: "Email",
              icon: "envelope-open",
              children: [
                {
                  name: "Inbox",
                  to: "/email/inbox",
                },
                {
                  name: "Email detail",
                  to: "/email/email-detail",
                },
                {
                  name: "Compose",
                  to: "/email/compose",
                },
              ],
            },
            {
              name: "Events",
              icon: "calendar-day",
              children: [
                {
                  name: "Create an event",
                  to: "/events/create-an-event",
                },
                {
                  name: "Event detail",
                  to: "/events/event-detail",
                },
                {
                  name: "Event list",
                  to: "/events/event-list",
                },
              ],
            },
            {
              name: "E Commerce",
              icon: "shopping-cart",
              children: [
                {
                  name: "Product",
                  children: [
                    {
                      name: "Product list",
                      to: "/e-commerce/product/product-list",
                    },
                    {
                      name: "Product grid",
                      to: "/e-commerce/product/product-grid",
                    },
                    {
                      name: "Product details",
                      to: "/e-commerce/product/product-details",
                    },
                  ],
                },
                {
                  name: "Orders",
                  children: [
                    {
                      name: "Order list",
                      to: "/e-commerce/orders/order-list",
                    },
                    {
                      name: "Order details",
                      to: "/e-commerce/orders/order-details",
                    },
                  ],
                },
                {
                  name: "Customers",
                  to: "/e-commerce/customers",
                },
                {
                  name: "Customer details",
                  to: "/e-commerce/customer-details",
                },
                {
                  name: "Shopping cart",
                  to: "/e-commerce/shopping-cart",
                },
                {
                  name: "Checkout",
                  to: "/e-commerce/checkout",
                },
                {
                  name: "Billing",
                  to: "/e-commerce/billing",
                },
                {
                  name: "Invoice",
                  to: "/e-commerce/invoice",
                },
              ],
            },
            {
              name: "Kanban",
              icon: ["fab", "trello"],
              to: "/app/kanban",
            },
            {
              name: "Social",
              icon: "share-alt",
              active: true,
              children: [
                {
                  name: "Feed",
                  to: "/social/feed",
                  active: true,
                },
                {
                  name: "Activity log",
                  to: "/social/activity-log",
                  active: true,
                },
                {
                  name: "Notifications",
                  to: "/social/notifications",
                  active: true,
                },
                {
                  name: "Followers",
                  to: "/social/followers",
                  active: true,
                },
              ],
            },
          ],
        },
        {
          label: "pages",
          children: [
            {
              name: "Starter",
              icon: "flag",
              to: "/pages/starter",
              active: true,
            },
            {
              name: "Landing",
              icon: "globe",
              to: "/",
              active: true,
            },
            {
              name: "Authentication",
              icon: "lock",
              active: true,
              children: [
                {
                  name: "Card",
                  active: true,
                  children: [
                    {
                      name: "Login",
                      to: "/authentication/login",
                      active: true,
                    },
                    {
                      name: "Logout",
                      to: "/authentication/logout",
                      active: true,
                    },
                    {
                      name: "Register",
                      to: "/authentication/register",
                      active: true,
                    },
                    {
                      name: "Forgot password",
                      to: "/authentication/forgot-password",
                      active: true,
                    },
                    {
                      name: "Confirm mail",
                      to: "/authentication/confirm-mail",
                      active: true,
                    },
                    {
                      name: "Reset password",
                      to: "/authentication/reset-password",
                      active: true,
                    },
                    {
                      name: "Lock screen",
                      to: "/authentication/lock-screen",
                      active: true,
                    },
                  ],
                },
                {
                  name: "Wizard",
                  to: "/authentication/wizard",
                  active: true,
                },
                {
                  name: "Modal",
                  to: "/authentication-modal",
                  active: true,
                },
              ],
            },
            {
              name: "User",
              icon: "user",
              active: true,
              children: [
                {
                  name: "Profile",
                  to: "/user/profile",
                  active: true,
                },
                {
                  name: "Settings",
                  to: "/user/settings",
                  active: true,
                },
              ],
            },
            {
              name: "Pricing",
              icon: "tags",
              children: [
                {
                  name: "Pricing default",
                  to: "/pricing/pricing-default",
                },
                {
                  name: "Pricing alt",
                  to: "/pricing/pricing-alt",
                },
              ],
            },
            {
              name: "Faq",
              icon: "question-circle",
              children: [
                {
                  name: "Faq basic",
                  to: "/faq/faq-basic",
                },
                {
                  name: "Faq alt",
                  to: "/faq/faq-alt",
                },
                {
                  name: "Faq accordion",
                  to: "/faq/faq-accordion",
                },
              ],
            },
            {
              name: "Errors",
              active: true,
              icon: "exclamation-triangle",
              children: [
                {
                  name: "404",
                  to: "/errors/404",
                  active: true,
                },
                {
                  name: "500",
                  to: "/errors/500",
                  active: true,
                },
              ],
            },
            {
              name: "Miscellaneous",
              icon: "thumbtack",
              active: true,
              children: [
                {
                  name: "Associations",
                  to: "/miscellaneous/associations",
                  active: true,
                },
                {
                  name: "Invite people",
                  to: "/miscellaneous/invite-people",
                },
                {
                  name: "Privacy policy",
                  to: "/miscellaneous/privacy-policy",
                },
              ],
            },
          ],
        },
        {
          label: "Modules",
          children: [
            {
              name: "Forms",
              active: true,
              icon: "file-alt",
              children: [
                {
                  name: "Basic",
                  active: true,
                  children: [
                    {
                      name: "Form control",
                      to: "/forms/basic/form-control",
                      active: true,
                    },
                    {
                      name: "Input group",
                      to: "/forms/basic/input-group",
                      active: true,
                    },
                    {
                      name: "Select",
                      to: "/forms/basic/select",
                      active: true,
                    },
                    {
                      name: "Checks",
                      to: "/forms/basic/checks",
                      active: true,
                    },
                    {
                      name: "Range",
                      to: "/forms/basic/range",
                      active: true,
                    },
                    {
                      name: "Layout",
                      to: "/forms/basic/layout",
                      active: true,
                    },
                  ],
                },
                {
                  name: "Advance",
                  active: true,
                  children: [
                    {
                      name: "Advance select",
                      to: "/forms/advance/advance-select",
                    },
                    {
                      name: "Date picker",
                      to: "/forms/advance/date-picker",
                      active: true,
                    },
                    {
                      name: "Editor",
                      to: "/forms/advance/editor",
                    },
                    {
                      name: "Emoji button",
                      to: "/forms/advance/emoji-button",
                    },
                    {
                      name: "File uploader",
                      to: "/forms/advance/file-uploader",
                      active: true,
                    },
                    {
                      name: "Rating",
                      to: "/forms/advance/rating",
                    },
                  ],
                },
                {
                  name: "Floating labels",
                  to: "/forms/floating-labels",
                  active: true,
                },
                {
                  name: "Wizard",
                  to: "/forms/wizard",
                  active: true,
                },
                {
                  name: "Validation",
                  to: "/forms/validation",
                  active: true,
                },
              ],
            },
            {
              name: "Tables",
              icon: "table",
              active: true,
              children: [
                {
                  name: "Basic tables",
                  to: "/tables/basic-tables",
                  active: true,
                },
                {
                  name: "Advance tables",
                  to: "/tables/advance-tables",
                  active: true,
                },
                {
                  name: "Bulk select",
                  to: "/tables/bulk-select",
                },
              ],
            },
            {
              name: "Charts",
              icon: "chart-line",
              children: [
                {
                  name: "Chartjs",
                  to: "/charts/chartjs",
                },
                {
                  name: "ECharts",
                  children: [
                    {
                      name: "Line charts",
                      to: "/charts/echarts/line-charts",
                    },
                    {
                      name: "Bar charts",
                      to: "/charts/echarts/bar-charts",
                    },
                    {
                      name: "Candlestick charts",
                      to: "/charts/echarts/candlestick-charts",
                    },
                    {
                      name: "Geo map",
                      to: "/charts/echarts/geo-map",
                    },
                    {
                      name: "Scatter charts",
                      to: "/charts/echarts/scatter-charts",
                    },
                    {
                      name: "Pie charts",
                      to: "/charts/echarts/pie-charts",
                    },
                    {
                      name: "Radar charts",
                      to: "/charts/echarts/radar-charts",
                    },
                    {
                      name: "Heatmap charts",
                      to: "/charts/echarts/heatmap-charts",
                    },
                    {
                      name: "How to use",
                      to: "/charts/echarts/how-to-use",
                    },
                  ],
                },
              ],
            },
            {
              name: "icons",
              active: true,
              icon: "shapes",
              children: [
                {
                  name: "Font awesome",
                  to: "/icons/font-awesome",
                  active: true,
                },
                {
                  name: "Bootstrap icons",
                  to: "/icons/bootstrap-icons",
                },
                {
                  name: "Feather",
                  to: "/icons/feather",
                },
                {
                  name: "Material icons",
                  to: "/icons/material-icons",
                },
              ],
            },
            {
              name: "Maps",
              icon: "map",
              children: [
                {
                  name: "Google map",
                  to: "/maps/google-map",
                },
                {
                  name: "Leaflet map",
                  to: "/maps/leaflet-map",
                },
              ],
            },
            {
              name: "Components",
              active: true,
              icon: "puzzle-piece",
              children: [
                {
                  name: "Alerts",
                  to: "/components/alerts",
                  active: true,
                },
                {
                  name: "Accordion",
                  to: "/components/accordion",
                  active: true,
                },
                {
                  name: "Animated icons",
                  to: "/components/animated-icons",
                  active: true,
                },
                {
                  name: "Background",
                  to: "/components/background",
                  active: true,
                },
                {
                  name: "Badges",
                  to: "/components/badges",
                  active: true,
                },
                {
                  name: "Breadcrumbs",
                  to: "/components/breadcrumb",
                  active: true,
                },
                {
                  name: "Buttons",
                  to: "/components/buttons",
                  active: true,
                },
                {
                  name: "Calendar",
                  to: "/components/calendar",
                },
                {
                  name: "Cards",
                  to: "/components/cards",
                  active: true,
                },
                {
                  name: "Carousel",
                  active: true,
                  children: [
                    {
                      name: "Bootstrap",
                      to: "/components/carousel/bootstrap",
                      label: "bootstrap-carousel",
                      active: true,
                    },
                    {
                      name: "Slick",
                      to: "/components/carousel/slick",
                      active: true,
                    },
                  ],
                },
                {
                  name: "Collapse",
                  to: "/components/collapse",
                  active: true,
                },
                {
                  name: "Cookie notice",
                  to: "/components/cookie-notice",
                },
                {
                  name: "Countup",
                  to: "/components/countup",
                },
                {
                  name: "Draggable",
                  to: "/components/draggable",
                },
                {
                  name: "Dropdowns",
                  to: "/components/dropdowns",
                  active: true,
                },
                {
                  name: "List group",
                  to: "/components/list-group",
                  active: true,
                },
                {
                  name: "Modals",
                  to: "/components/modals",
                  active: true,
                },
                {
                  name: "Offcanvas",
                  to: "/components/offcanvas",
                  active: true,
                },
                {
                  name: "Navs & Tabs",
                  active: true,
                  children: [
                    {
                      name: "Navs",
                      to: "/components/navs-and-tabs/navs",
                      active: true,
                    },
                    {
                      name: "Navbar",
                      to: "/components/navs-and-tabs/navbar",
                      active: true,
                    },
                    {
                      name: "Vertical navbar",
                      to: "/components/navs-and-tabs/vertical-navbar",
                      active: true,
                    },
                    {
                      name: "top navbar",
                      to: "/components/navs-and-tabs/top-navbar",
                      active: true,
                    },
                    {
                      name: "Combo navbar",
                      to: "/components/navs-and-tabs/combo-navbar",
                      active: true,
                    },
                    {
                      name: "Tabs",
                      to: "/components/navs-and-tabs/tabs",
                      active: true,
                    },
                  ],
                },
                {
                  name: "Pictures",
                  active: true,
                  children: [
                    {
                      name: "Avatar",
                      to: "/components/pictures/avatar",
                      active: true,
                    },
                    {
                      name: "Images",
                      to: "/components/pictures/images",
                      active: true,
                    },
                    {
                      name: "Figures",
                      to: "/components/pictures/figures",
                      active: true,
                    },
                    {
                      name: "Hoverbox",
                      to: "/components/pictures/hoverbox",
                      active: true,
                    },
                    {
                      name: "Lightbox",
                      to: "/components/pictures/lightbox",
                      active: true,
                    },
                  ],
                },
                {
                  name: "Progress Bar",
                  to: "/components/progress-bar",
                  active: true,
                },
                {
                  name: "Pagination",
                  to: "/components/pagination",
                  active: true,
                },
                {
                  name: "Placeholder",
                  to: "/components/placeholder",
                  active: true,
                },
                {
                  name: "Popovers",
                  to: "/components/popovers",
                  active: true,
                },
                {
                  name: "Scrollspy",
                  to: "/components/scrollspy",
                },
                {
                  name: "Search",
                  to: "/components/search",
                  active: true,
                },
                {
                  name: "Spinners",
                  to: "/components/spinners",
                  active: true,
                },
                {
                  name: "toasts",
                  to: "/components/toasts",
                  active: true,
                },
                {
                  name: "tooltips",
                  to: "/components/tooltips",
                  active: true,
                },
                {
                  name: "Typed text",
                  to: "/components/typed-text",
                  active: true,
                },
                {
                  name: "Videos",
                  active: true,
                  children: [
                    {
                      name: "Embed",
                      to: "/components/videos/embed",
                      active: true,
                    },
                    {
                      name: "Plyr",
                      to: "/components/videos/plyr",
                    },
                  ],
                },
              ],
            },
            {
              name: "Utilities",
              active: true,
              icon: "fire",
              children: [
                {
                  name: "Borders",
                  to: "/utilities/borders",
                  active: true,
                },
                {
                  name: "Colors",
                  to: "/utilities/colors",
                  active: true,
                },
                {
                  name: "Colored links",
                  to: "/utilities/colored-links",
                  active: true,
                },
                {
                  name: "Display",
                  to: "/utilities/display",
                  active: true,
                },
                {
                  name: "Flex",
                  to: "/utilities/flex",
                  active: true,
                },
                {
                  name: "Float",
                  to: "/utilities/float",
                  active: true,
                },
                {
                  name: "Grid",
                  to: "/utilities/grid",
                  active: true,
                },
                {
                  name: "Overlayscrollbars",
                  to: "/utilities/overlayscrollbars",
                },
                {
                  name: "Position",
                  to: "/utilities/position",
                  active: true,
                },
                {
                  name: "Spacing",
                  to: "/utilities/spacing",
                  active: true,
                },
                {
                  name: "Sizing",
                  to: "/utilities/sizing",
                  active: true,
                },
                {
                  name: "Stretched link",
                  to: "/utilities/stretched-link",
                  active: true,
                },
                {
                  name: "Text truncation",
                  to: "/utilities/text-truncation",
                  active: true,
                },
                {
                  name: "Typography",
                  to: "/utilities/typography",
                  active: true,
                },
                {
                  name: "Vertical align",
                  to: "/utilities/vertical-align",
                  active: true,
                },
                {
                  name: "Visibility",
                  to: "/utilities/visibility",
                  active: true,
                },
              ],
            },
            {
              name: "Widgets",
              icon: "poll",
              to: "/widgets",
            },
            {
              name: "Multi level",
              active: true,
              icon: "layer-group",
              children: [
                {
                  name: "Level two",
                  active: true,
                  children: [
                    {
                      name: "Item 1",
                      active: true,
                      to: "#!",
                    },
                    {
                      name: "Item 2",
                      active: true,
                      to: "#!",
                    },
                  ],
                },
                {
                  name: "Level three",
                  active: true,
                  children: [
                    {
                      name: "Item 3",
                      active: true,
                      to: "#!",
                    },
                    {
                      name: "Item 4",
                      active: true,
                      children: [
                        {
                          name: "Item 5",
                          active: true,
                          to: "#!",
                        },
                        {
                          name: "Item 6",
                          active: true,
                          to: "#!",
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Level four",
                  active: true,
                  children: [
                    {
                      name: "Item 6",
                      active: true,
                      to: "#!",
                    },
                    {
                      name: "Item 7",
                      active: true,
                      children: [
                        {
                          name: "Item 8",
                          active: true,
                          to: "#!",
                        },
                        {
                          name: "Item 9",
                          active: true,
                          children: [
                            {
                              name: "Item 10",
                              active: true,
                              to: "#!",
                            },
                            {
                              name: "Item 11",
                              active: true,
                              to: "#!",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "documentation",
          children: [
            {
              name: "Getting started",
              icon: "rocket",
              to: "/documentation/getting-started",
              active: true,
            },
            {
              name: "Customization",
              active: true,
              icon: "wrench",
              children: [
                {
                  name: "Configuration",
                  to: "/documentation/configuration",
                  active: true,
                },
                {
                  name: "Styling",
                  to: "/documentation/styling",
                  active: true,
                },
                {
                  name: "Dark mode",
                  to: "/documentation/dark-mode",
                  active: true,
                  badge: {
                    type: "success",
                    text: "New",
                  },
                },
                {
                  name: "Plugin",
                  to: "/documentation/plugin",
                  active: true,
                },
              ],
            },
            {
              name: "Design file",
              icon: "palette",
              to: "/documentation/design-file",
              active: true,
            },
            {
              name: "Changelog",
              icon: "code-branch",
              to: "/changelog",
              active: true,
            },
          ],
        },
      ],
      firstName: process.env.FRISTNAME || "Samyr",
      lastName: process.env.LASTNAME || "Saldarriaga",
      username: process.env.USERNAME || "Admin",
      email: process.env.EMAIL || "s4m1r.5a@gmail.com",
      password: await User.encryptPassword(process.env.PASSWORD || "password"),
      document: process.env.DOCUMET || "1082926704",
      documentType: process.env.DOCUTYPE || "cedula de ciudadania",
      phone: process.env.PHONE || "57 3012673944",
    });
    console.log("Admin User Created!");
  } */
};
