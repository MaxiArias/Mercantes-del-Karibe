package uy.com.karibe.rest;

import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;

import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.google.gson.Gson;
import com.mysql.jdbc.Connection;

import uy.com.karibe.access.DatabaseAccess;
import uy.com.karibe.domain.Ship;

@Path("/ships")
@Singleton
public class ShipService {
	private Connection con;
	
	public ShipService() {
		String driver = "com.mysql.jdbc.Driver";
		try {
			Class.forName(driver);
			String url = "jdbc:mysql://localhost:3306/mdk";
			con = (Connection) DriverManager
					.getConnection(url, "root", "toor");
		} catch (ClassNotFoundException | SQLException e) {
			System.out.println(e.getMessage());
		}
	}
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String getShips () {
		List<Ship> ships = DatabaseAccess.selectShips(con);
		return new Gson().toJson(ships);
	}
	
	@POST
	@Produces(MediaType.TEXT_PLAIN)
	//@Path("/save")
	public String saveShips(String jsonShips) {	
		try {
			Ship[] ships = new Gson().fromJson(jsonShips, Ship[].class);
			
			DatabaseAccess.deleteShips(con);
			
			for (Ship ship : ships) {
				DatabaseAccess.insertShip(con, ship);
			}
		} catch (Exception e) {
			return e.getMessage();
		}
		
		return "success";
	}
}