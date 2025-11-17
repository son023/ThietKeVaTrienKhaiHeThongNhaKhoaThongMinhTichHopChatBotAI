package com.main_project.appointment_service.repository;

import com.main_project.appointment_service.entity.MedicalService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MedicalServiceRepository extends JpaRepository<MedicalService, UUID> {

    // 🔹 READ — Tìm dịch vụ theo tên chính xác
    @Query("SELECT m FROM MedicalService m WHERE LOWER(m.serviceName) = LOWER(:name)")
    List<MedicalService> findByServiceName(@Param("name") String name);

    // 🔹 READ — Tìm dịch vụ có tên gần giống (search keyword)
    @Query("SELECT m FROM MedicalService m WHERE LOWER(m.serviceName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<MedicalService> searchByServiceName(@Param("keyword") String keyword);

    // 🔹 READ — Lấy danh sách theo loại dịch vụ
    @Query("SELECT m FROM MedicalService m WHERE LOWER(m.serviceType) = LOWER(:type)")
    List<MedicalService> findByServiceType(@Param("type") String type);

    // 🔹 COUNT — Đếm số lượng dịch vụ theo loại
    @Query("SELECT COUNT(m) FROM MedicalService m WHERE LOWER(m.serviceType) = LOWER(:type)")
    long countByServiceType(@Param("type") String type);

    // 🔹 COUNT — Đếm số lượng dịch vụ theo tên
    @Query("SELECT COUNT(m) FROM MedicalService m WHERE LOWER(m.serviceName) = LOWER(:name)")
    long countByServiceName(@Param("name") String name);

    // 🔹 DELETE — Xóa theo loại dịch vụ
    @Query("DELETE FROM MedicalService m WHERE LOWER(m.serviceType) = LOWER(:type)")
    void deleteByServiceType(@Param("type") String type);

    // 🔹 DELETE — Xóa theo tên dịch vụ
    @Query("DELETE FROM MedicalService m WHERE LOWER(m.serviceName) = LOWER(:name)")
    void deleteByServiceName(@Param("name") String name);
}
