await client.connect();
  try {
    const result = await client.query(selectUserQuery, [emailToSearch]);
    console.log("User found:", result.rows);
  } catch (err) {
    console.error("Error selecting user:", err);
  } finally {
    await client.end();
  }