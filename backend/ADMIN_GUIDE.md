# Admin Guide

## Sign in

- Open `/admin-login` in the frontend.
- Use an account with `role: "admin"`.
- The admin dashboard is protected and redirects unauthorized users away.

## Create the first admin

- Create a normal user account, then update the user record in MongoDB and set `role` to `admin`.
- You can also use the admin role-change endpoint after one admin already exists.

## Create additional admins

- Log in as an existing admin.
- Open the Users tab in the dashboard.
- Use the `Make admin` action on the target account.

## Block or unblock users

- Open the Users tab.
- Use the `Block` or `Unblock` action.
- Blocked users cannot log in and are rejected by the auth middleware.

## Manage products

- Open the Products tab.
- Add a product, or edit an existing one.
- The dashboard supports stock, subcategory, featured state, and active/disabled state.
- Disabled products are hidden from the customer storefront.

## Manage orders

- Open the Orders tab.
- The dashboard can update status, tracking number, and refunds.
- Orders must exist in the database for this tab to show records.
- If the checkout flow is not creating orders yet, the admin panel will still be ready for them.

## Password reset

- Use the existing customer password reset flow.
- Admin accounts use the same auth model and can reset passwords through the same backend endpoints.
