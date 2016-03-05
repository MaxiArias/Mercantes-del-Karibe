/*
 * Island.java
 *
 * MDK 4.0.1 - Clase de la entidad isla.
 *
 * 05/03/2016
 *
 * Copyright Drintin© 2016
 */
package uy.com.karibe.domain;

public class Island {
	private int x;
	private int y;
	private int width;
	private int height;
	
	public Island(int x, int y, int width, int height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	
	public int getX() {
		return x;
	}
	
	public int getY() {
		return y;
	}
	
	public int getWidth() {
		return width;
	}
	
	public int getHeight() {
		return height;
	}
	
	public void setX(int x) {
		this.x = x;
	}
	
	public void setY(int y) {
		this.y = y;
	}
	
	public void setWidth(int width) {
		this.width = width;
	}
	
	public void setHeight(int height) {
		this.height = height;
	}
}