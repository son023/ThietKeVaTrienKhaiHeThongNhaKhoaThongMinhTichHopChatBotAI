package com.main_project.doctor_service.enums;

public enum SpecializationEnum {
    GEN("General Dentistry"),
    ENDO("Endodontics (N?i nha)"),
    ORTHO("Orthodontics (Ch?nh nha)"),
    PERIO("Periodontics (Nha chu)"),
    PROSTH("Prosthodontics (Ph?c hình rang)"),
    IMPL("Implant Dentistry"),
    OMFS("Oral & Maxillofacial Surgery"),
    PEDO("Pediatric Dentistry"),
    COS("Cosmetic Dentistry"),
    OMDIAG("Oral Medicine"),
    RAD("Radiology");

    private final String displayName;

    SpecializationEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
