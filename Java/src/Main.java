
public class Main {

	public static void main(String[] args) {
		IDandPassword idAndPassword = new IDandPassword();
		LoginPage loginPage = new LoginPage(idAndPassword.getLoginInfo());
	}

}
