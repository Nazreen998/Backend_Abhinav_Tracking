// utils/notifications.js

// Notification for shop visit completion
export const notifyVisitCompleted = (salesman, shop, result, distance) => {
  return {
    title: "Shop Visit Completed",
    message: `${salesman.name} visited ${shop.shop_name} (${result.toUpperCase()})`,
    salesman_id: salesman.user_id,
    salesman_name: salesman.name,
    shop_id: shop.shop_id,
    shop_name: shop.shop_name,
    result: result,
    distance: distance.toFixed(2),
    time: new Date().toLocaleTimeString("en-GB"),
    date: new Date().toLocaleDateString("en-GB")
  };
};


// Notification for pending shop approval
export const notifyShopApproved = (shop, salesman) => {
  return {
    title: "Shop Approved",
    message: `Your shop "${shop.shop_name}" has been approved`,
    shop_id: shop.shop_id,
    salesman_id: salesman.user_id,
    date: new Date().toLocaleDateString("en-GB")
  };
};


// Notification for new shop assignment
export const notifyShopAssigned = (salesman, count) => {
  return {
    title: "New Shop Assignment",
    message: `You have been assigned ${count} new shop(s)`,
    salesman_id: salesman.user_id,
    salesman_name: salesman.name,
    date: new Date().toLocaleDateString("en-GB")
  };
};
