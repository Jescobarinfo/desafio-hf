--
-- PostgreSQL database initialization script
-- Database: desafio_hf
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- ===================================
-- STORED PROCEDURES / FUNCTIONS
-- ===================================

-- Function: sp_upsert_category
CREATE FUNCTION public.sp_upsert_category(p_category_name character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_category_id INTEGER;
BEGIN
    -- Buscar si existe la categoría
    SELECT category_id INTO v_category_id
    FROM categories
    WHERE LOWER(category_name) = LOWER(p_category_name);

    -- Si no existe, crearla
    IF v_category_id IS NULL THEN
        INSERT INTO categories (category_name)
        VALUES (p_category_name)
        RETURNING category_id INTO v_category_id;
    END IF;

    RETURN v_category_id;
END;
$$;

-- Function: sp_create_category
CREATE FUNCTION public.sp_create_category(p_category_name character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_category_id INTEGER;
BEGIN
    INSERT INTO categories (category_name)
    VALUES (p_category_name)
    RETURNING category_id INTO v_category_id;

    RETURN v_category_id;
END;
$$;

-- Function: sp_get_all_categories
CREATE FUNCTION public.sp_get_all_categories() RETURNS TABLE(category_id integer, category_name character varying, created_at timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT c.category_id, c.category_name, c.created_at
    FROM categories c
    ORDER BY c.category_id;
END;
$$;

-- Function: sp_create_product (with ratings support)
CREATE FUNCTION public.sp_create_product(
    p_product_id integer,
    p_title character varying,
    p_price numeric,
    p_description text,
    p_category_id integer,
    p_image_url character varying,
    p_rating_score numeric DEFAULT NULL::numeric,
    p_review_count integer DEFAULT 0
) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_product_id INTEGER;
BEGIN
    -- Insertar el producto
    INSERT INTO products (product_id, title, price, description, category_id, image_url)
    VALUES (p_product_id, p_title, p_price, p_description, p_category_id, p_image_url)
    RETURNING product_id INTO v_product_id;

    -- Insertar el rating si se proporcionó
    IF p_rating_score IS NOT NULL THEN
        INSERT INTO product_ratings (product_id, rating_score, review_count)
        VALUES (v_product_id, p_rating_score, p_review_count);
    END IF;

    RETURN v_product_id;
END;
$$;

-- Function: sp_update_product (with ratings support)
CREATE FUNCTION public.sp_update_product(
    p_product_id integer,
    p_title character varying,
    p_price numeric,
    p_description text,
    p_category_id integer,
    p_image_url character varying,
    p_rating_score numeric DEFAULT NULL::numeric,
    p_review_count integer DEFAULT NULL::integer
) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_updated INTEGER;
    v_rating_exists BOOLEAN;
BEGIN
    -- Actualizar el producto
    UPDATE products
    SET
        title = p_title,
        price = p_price,
        description = p_description,
        category_id = p_category_id,
        image_url = p_image_url,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = p_product_id;

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    -- Verificar si existe un rating para este producto
    SELECT EXISTS(SELECT 1 FROM product_ratings WHERE product_id = p_product_id) INTO v_rating_exists;

    -- Si se proporcionó rating_score, actualizar o insertar en product_ratings
    IF p_rating_score IS NOT NULL THEN
        IF v_rating_exists THEN
            -- Actualizar rating existente
            UPDATE product_ratings
            SET rating_score = p_rating_score,
                review_count = COALESCE(p_review_count, review_count),
                last_updated = CURRENT_TIMESTAMP
            WHERE product_id = p_product_id;
        ELSE
            -- Insertar nuevo rating
            INSERT INTO product_ratings (product_id, rating_score, review_count)
            VALUES (p_product_id, p_rating_score, COALESCE(p_review_count, 0));
        END IF;
    ELSIF p_rating_score IS NULL AND v_rating_exists THEN
        -- Si no se proporcionó rating pero existe uno, eliminarlo
        DELETE FROM product_ratings WHERE product_id = p_product_id;
    END IF;

    RETURN v_updated > 0;
END;
$$;

-- Function: sp_delete_product
CREATE FUNCTION public.sp_delete_product(p_product_id integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM products
    WHERE product_id = p_product_id;

    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted > 0;
END;
$$;

-- Function: sp_get_all_products
CREATE FUNCTION public.sp_get_all_products() RETURNS TABLE(
    product_id integer,
    title character varying,
    price numeric,
    description text,
    category_id integer,
    category_name character varying,
    image_url character varying,
    rating_score numeric,
    review_count integer
)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.product_id,
        p.title,
        p.price,
        p.description,
        p.category_id,
        c.category_name,
        p.image_url,
        pr.rating_score,
        pr.review_count
    FROM products p
    INNER JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN product_ratings pr ON p.product_id = pr.product_id
    ORDER BY p.product_id;
END;
$$;

-- Function: sp_bulk_insert_product
CREATE FUNCTION public.sp_bulk_insert_product(
    p_product_id integer,
    p_title character varying,
    p_price numeric,
    p_description text,
    p_category_name character varying,
    p_image_url character varying,
    p_rating_score numeric,
    p_rating_count integer
) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_category_id INTEGER;
    v_product_id INTEGER;
BEGIN
    -- Obtener o crear categoría
    v_category_id := sp_upsert_category(p_category_name);

    -- Insertar o actualizar producto
    INSERT INTO products (product_id, title, price, description, category_id, image_url)
    VALUES (p_product_id, p_title, p_price, p_description, v_category_id, p_image_url)
    ON CONFLICT (product_id)
    DO UPDATE SET
        title = EXCLUDED.title,
        price = EXCLUDED.price,
        description = EXCLUDED.description,
        category_id = EXCLUDED.category_id,
        image_url = EXCLUDED.image_url,
        updated_at = CURRENT_TIMESTAMP
    RETURNING product_id INTO v_product_id;

    -- Insertar o actualizar rating
    INSERT INTO product_ratings (product_id, rating_score, review_count)
    VALUES (v_product_id, p_rating_score, p_rating_count)
    ON CONFLICT (product_id)
    DO UPDATE SET
        rating_score = EXCLUDED.rating_score,
        review_count = EXCLUDED.review_count,
        last_updated = CURRENT_TIMESTAMP;

    RETURN v_product_id;
END;
$$;

-- ===================================
-- TABLES
-- ===================================

-- Table: categories
CREATE TABLE IF NOT EXISTS public.categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: products
CREATE TABLE IF NOT EXISTS public.products (
    product_id INTEGER PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT products_price_check CHECK (price >= 0),
    CONSTRAINT fk_category FOREIGN KEY (category_id)
        REFERENCES public.categories (category_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- Table: product_ratings
CREATE TABLE IF NOT EXISTS public.product_ratings (
    rating_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL UNIQUE,
    rating_score NUMERIC(2,1),
    review_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product FOREIGN KEY (product_id)
        REFERENCES public.products (product_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT product_ratings_rating_score_check CHECK (rating_score >= 0 AND rating_score <= 5),
    CONSTRAINT product_ratings_review_count_check CHECK (review_count >= 0)
);

-- ===================================
-- INDEXES
-- ===================================

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_ratings_score ON public.product_ratings(rating_score);

-- ===================================
-- INITIAL DATA
-- ===================================

-- Insert initial categories
INSERT INTO public.categories (category_name) VALUES
    ('ropa de hombre'),
    ('joyería'),
    ('electrónica')
ON CONFLICT (category_name) DO NOTHING;

-- Insert initial products
INSERT INTO public.products (product_id, title, price, description, category_id, image_url, created_at, updated_at) VALUES
(1, 'Fjallraven - Mochila Foldsack No. 1, para laptops de 15 pulgadas', 109.95, 'Tu mochila perfecta para el uso diario y paseos por el bosque. Guarda tu laptop (hasta 15 pulgadas) en la funda acolchada, tu compañera de todos los días', 1, 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Camisetas de hombre casual premium slim fit', 22.30, 'Estilo ajustado, manga larga raglán en contraste, placket henley de tres botones, tela ligera y suave para un uso transpirable y cómodo. Camisetas cosidas sólidas con cuello redondo, hechas para durabilidad y gran ajuste para moda casual y fanáticos del béisbol. El escote redondo estilo Henley incluye un placket de tres botones.', 1, 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Chaqueta de algodón para hombre', 55.99, 'Excelentes chaquetas de abrigo para primavera/otoño/invierno, adecuadas para muchas ocasiones, como trabajo, senderismo, campamento, escalada, ciclismo, viajes u otras actividades al aire libre. Buena opción de regalo para ti o un familiar. Un cariñoso regalo para padre, esposo o hijo en este Día de Acción de Gracias o Navidad.', 1, 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Slim Fit casual para hombre', 15.99, 'El color podría ser ligeramente diferente entre la pantalla y la práctica. / Ten en cuenta que las complexiones varían según la persona, por lo tanto, revisa la información de tallas detallada más abajo en la descripción del producto.', 1, 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Pulsera John Hardy Women''s Legends Naga Oro y Plata con Estación Dragón', 695.00, 'De nuestra Colección Legends, el Naga se inspiró en el mítico dragón de agua que protege la perla del océano. Llévalo hacia adentro para recibir amor y abundancia, o hacia afuera para protección.', 2, 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_t.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'Oro macizo petite micropavé', 168.00, 'Satisfacción garantizada. Devuelve o cambia cualquier pedido dentro de los 30 días. Diseñado y vendido por Hafeez Center en Estados Unidos. Satisfacción garantizada. Devuelve o cambia cualquier pedido dentro de los 30 días.', 2, 'https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_t.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'Anillo Princesa chapado en oro blanco', 9.99, 'Anillo de compromiso clásico con solitario de diamante creado para ella. Regalos para consentir más a tu amor en compromiso, boda, aniversario, Día de San Valentín...', 2, 'https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_t.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'Pierced Owl Túnel Doble Acampanado Acero Inoxidable Chapado en Oro Rosa', 10.99, 'Túneles dobles acampanados chapados en oro rosa. Hechos de acero inoxidable 316L', 2, 'https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_t.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'Disco duro externo portátil WD 2TB Elements - USB 3.0', 64.00, 'Compatibilidad USB 3.0 y USB 2.0, transferencias rápidas de datos, mejora el rendimiento de la PC, alta capacidad. Formateado en NTFS para Windows 10, 8.1 y 7; puede requerir reformateo para otros sistemas operativos; la compatibilidad puede variar según la configuración del hardware y el sistema operativo del usuario.', 3, 'https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_t.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'SanDisk SSD PLUS 1TB Interno - SATA III 6 Gb/s', 109.00, 'Fácil actualización para un arranque más rápido, apagado, carga de aplicaciones y respuesta (comparado con un disco duro SATA de 5400 RPM de 2.5"). Mejora el rendimiento de escritura en ráfaga, ideal para cargas típicas de PC. El equilibrio perfecto entre rendimiento y fiabilidad. Velocidades de lectura/escritura de hasta 535MB/s/450MB/s (según pruebas internas; el rendimiento puede variar según capacidad, dispositivo anfitrión, SO y aplicación).', 3, 'https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_t.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (product_id) DO NOTHING;

-- Insert product ratings
INSERT INTO public.product_ratings (product_id, rating_score, review_count, last_updated) VALUES
(1, 3.9, 120, CURRENT_TIMESTAMP),
(2, 4.1, 259, CURRENT_TIMESTAMP),
(3, 4.7, 500, CURRENT_TIMESTAMP),
(4, 2.1, 430, CURRENT_TIMESTAMP),
(5, 4.6, 400, CURRENT_TIMESTAMP),
(6, 3.9, 70, CURRENT_TIMESTAMP),
(7, 3.0, 400, CURRENT_TIMESTAMP),
(8, 1.9, 100, CURRENT_TIMESTAMP),
(9, 3.3, 203, CURRENT_TIMESTAMP),
(10, 2.9, 470, CURRENT_TIMESTAMP)
ON CONFLICT (product_id) DO NOTHING;
