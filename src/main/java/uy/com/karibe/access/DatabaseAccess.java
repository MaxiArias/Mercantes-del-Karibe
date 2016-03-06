/*
 * DatabaseAccess.java
 *
 * MDK 4.0.1 - Acceso a la BD 
 *
 * 06/03/2016
 *
 * Copyright Drintin© 2016
 */
package uy.com.karibe.access;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import com.mysql.jdbc.Connection;
import com.mysql.jdbc.PreparedStatement;
import com.mysql.jdbc.Statement;

import uy.com.karibe.domain.Island;
import uy.com.karibe.domain.Port;
import uy.com.karibe.domain.Ship;

public class DatabaseAccess {

	public static void deleteIslands(Connection con) {
		String query = Queries.deleteIslands();
		try
		{			
			Statement stmt = (Statement) con.createStatement();
			stmt.executeUpdate(query);
			stmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
	
	public static void deleteShips(Connection con) {
		String query = Queries.deleteShips();
		try
		{			
			Statement stmt = (Statement) con.createStatement();
			stmt.executeUpdate(query);
			stmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
	
	public static void deletePorts(Connection con) {
		String query = Queries.deletePorts();
		try
		{			
			Statement stmt = (Statement) con.createStatement();
			stmt.executeUpdate(query);
			stmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
	
	public static List<Ship> selectShips(Connection con) {
		String query = Queries.selectShips();
		List<Ship> ships = new ArrayList<Ship>();
		
		try {
			Statement stmt = (Statement) con.createStatement();
			ResultSet rs = stmt.executeQuery(query);
			while(rs.next()) {
				String name = rs.getString("name");
				int x = rs.getInt("x");
				int y = rs.getInt("y");
				int rotation = rs.getInt("rotation");
				int health = rs.getInt("health");
				
				Ship s = new Ship(name, x, y, rotation, health);
				ships.add(s);
			}
			rs.close();
			stmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
		
		return ships;
	}
	
	public static List<Island> selectIslands(Connection con) {
		String query = Queries.selectIslands();
		List<Island> islands = new ArrayList<Island>();
		
		try
		{			
			Statement stmt = (Statement) con.createStatement();
			ResultSet rs = stmt.executeQuery(query);
			while(rs.next()) {
				int x = rs.getInt("x");
				int y = rs.getInt("y");
				int width = rs.getInt("width");
				int height = rs.getInt("height");
				
				Island isl = new Island(x, y, width, height);
				islands.add(isl);
			}
			rs.close();
			stmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
		
		return islands;
	}
	//Se retona una lista con los puertos
	public static List<Port> selectPorts(Connection con) {
		String query = Queries.selectPorts();
		List<Port> ports = new ArrayList<Port>();
		
		try
		{			
			Statement stmt = (Statement) con.createStatement();
			ResultSet rs = stmt.executeQuery(query);
			while(rs.next()) {
				String name = rs.getString("name");
				int x = rs.getInt("x");
				
				Port p = new Port(x, name);
				ports.add(p);
			}
			rs.close();
			stmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
		
		return ports;
	}
	//Guardar posicion y tamaño de las islas
	public static void insertIsland(Connection con, Island isl){
		String query = Queries.insertIsland();
		try
		{			
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setInt(1, isl.getX());
			pstmt.setInt(2, isl.getY());
			pstmt.setInt(3, isl.getWidth());
			pstmt.setInt(4, isl.getHeight());
			pstmt.executeUpdate();
			pstmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
	//Guardar Puerto
	public static void insertPort(Connection con, Port p){
		String query = Queries.insertPort();
		try
		{			
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setString(1, p.getName());
			pstmt.setInt(2, p.getX());
			pstmt.executeUpdate();
			pstmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
	//Guardar barco
	public static void insertShip(Connection con, Ship s){
		String query = Queries.insertShip();
		try
		{			
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setString(1, s.getName());
			pstmt.setInt(2, s.getX());
			pstmt.setInt(3, s.getY());
			pstmt.setInt(4, s.getRotation());
			pstmt.setInt(5, s.getHealth());
			pstmt.executeUpdate();
			pstmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
}