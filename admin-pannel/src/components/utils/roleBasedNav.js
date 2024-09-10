// utils/roleBasedNav.js
export const filterNavByRole = (navItems, userRole) => {
    return navItems.filter(item => {
      if (!item.roles) return true; // No role restriction
      return item.roles.includes(userRole);
    }).map(item => {
      if (item.items) {
        return {
          ...item,
          items: filterNavByRole(item.items, userRole),
        };
      }
      return item;
    });
  };
  